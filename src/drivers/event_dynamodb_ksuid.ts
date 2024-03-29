import * as AWS from 'aws-sdk';
import DynamoDB, { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { Either, isRight, left, right } from 'fp-ts/lib/Either';
import { none, Option, some } from 'fp-ts/lib/Option';
import * as t from 'io-ts';
import { Event } from '../entities/types';
import { StoreEvents } from './event_sink';
import { GetAggregateEvents, GetAllEvents } from './event_source';

const EnrichedEvent = t.intersection([
  Event,
  t.type({
    TYPE: t.literal('EVENT'),
  }),
]);

type EnrichedEvent = t.TypeOf<typeof EnrichedEvent>;

const enrich = (event: Event): EnrichedEvent => {
  return { ...event, ...{ TYPE: 'EVENT' } };
};

export const storeEvents: StoreEvents = async (events: Event[], storeName: string): Promise<Option<Error>> => {
  const documentClient = new AWS.DynamoDB.DocumentClient();
  const maxAggregateVersions: {
    [key: string]: { maxAggregateVersion: number; aggregateEvents: number };
  } = events.reduce((acc: { [key: string]: { maxAggregateVersion: number; aggregateEvents: number } }, event) => {
    if (acc[event.aggregateId]) {
      acc[event.aggregateId] = {
        maxAggregateVersion: event.aggregateVersion,
        aggregateEvents: acc[event.aggregateId].aggregateEvents + 1,
      };
    } else {
      acc[event.aggregateId] = { maxAggregateVersion: event.aggregateVersion, aggregateEvents: 1 };
    }
    return acc;
  }, {});
  const aggregateVersionItems: DynamoDB.DocumentClient.TransactWriteItemList = Object.keys(maxAggregateVersions).map(
    (aggregateId) => {
      const aggregateDetails = maxAggregateVersions[aggregateId];
      return {
        Update: {
          TableName: storeName,
          Key: {
            aggregateId: 'MAXAGGREGATEVERSION#' + aggregateId,
            aggregateVersion: 0,
          },
          ConditionExpression:
            'attribute_not_exists(maxAggregateVersion) OR maxAggregateVersion = :currentAggregateVersion',
          UpdateExpression: 'SET maxAggregateVersion = :maxAggregateVersion',
          ExpressionAttributeValues: {
            ':maxAggregateVersion': aggregateDetails.maxAggregateVersion,
            ':currentAggregateVersion': aggregateDetails.maxAggregateVersion - aggregateDetails.aggregateEvents,
          },
        },
      };
    },
  );
  const items: DynamoDB.DocumentClient.TransactWriteItemList = aggregateVersionItems.concat(
    events.map(enrich).map((event) => {
      return { Put: { TableName: storeName, Item: event } };
    }),
  );
  console.log(items);
  return documentClient
    .transactWrite({
      TransactItems: items,
    })
    .promise()
    .then(() => {
      return none;
    })
    .catch((error) => {
      console.log(error);
      return some(new Error(error));
    });
};

const convertToEvent = (item: AttributeMap): Either<Error, Event> => {
  const event = Event.decode(item);
  return isRight(event) ? right(event.right) : left(new Error('Could not decode item'));
};

export const getAggregateEvents: GetAggregateEvents = (
  aggregate_id: string,
  storeName: string,
): Promise<Either<Error, Event[]>> => {
  const documentClient = new AWS.DynamoDB.DocumentClient({});
  return documentClient
    .query({
      TableName: storeName,
      KeyConditionExpression: 'aggregateId = :aggregate_id',
      ExpressionAttributeValues: {
        ':aggregate_id': aggregate_id,
      },
    })
    .promise()
    .then((response) => {
      return right(
        response
          .Items!.map(convertToEvent)
          .filter(isRight)
          .map((item) => item.right),
      );
    });
};

export const getAllEvents: GetAllEvents = (storeName: string): Promise<Either<Error, Event[]>> => {
  const documentClient = new AWS.DynamoDB.DocumentClient({});
  return documentClient
    .scan({
      IndexName: 'byEventId',
      TableName: storeName,
    })
    .promise()
    .then((response) => {
      return right(
        response
          .Items!.map(convertToEvent)
          .filter(isRight)
          .map((item) => item.right),
      );
    });
};
