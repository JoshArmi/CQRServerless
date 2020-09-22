import * as AWS from 'aws-sdk';
import { isRight } from 'fp-ts/lib/Either';
import { isNone } from 'fp-ts/lib/Option';
import { v4 } from 'uuid';
import { getAggregateEvents, getAllEvents, storeEvents } from '../../src/drivers/event_dynamodb';
import { AccountCreated } from '../../src/entities/types';
import KSUID from 'ksuid';

AWS.config.update({
  region: 'eu-west-1',
  dynamodb: {
    endpoint: 'http://localhost:4566',
  },
});

const accountCreated: AccountCreated = {
  aggregateId: v4(),
  aggregateVersion: 1,
  eventId: KSUID.randomSync().string,
  eventType: 'ACCOUNT_CREATED',
  eventVersion: 1,
  metadata: {
    amount: 10,
    name: 'Josh',
  },
};

const dynamodb = new AWS.DynamoDB();

const storeName = 'DriverTest';

describe('DynamoDB Driver', () => {
  beforeAll(() => {
    const params: AWS.DynamoDB.CreateTableInput = {
      AttributeDefinitions: [
        {
          AttributeName: 'eventId',
          AttributeType: 'S',
        },
        {
          AttributeName: 'aggregateId',
          AttributeType: 'S',
        },
        {
          AttributeName: 'aggregateVersion',
          AttributeType: 'N',
        },
        {
          AttributeName: 'TYPE',
          AttributeType: 'S',
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
      KeySchema: [
        {
          AttributeName: 'aggregateId',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'aggregateVersion',
          KeyType: 'RANGE',
        },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'byEventId',
          KeySchema: [
            {
              AttributeName: 'TYPE',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'eventId',
              KeyType: 'RANGE',
            },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
        },
      ],
      TableName: storeName,
    };
    return dynamodb.createTable(params).promise();
  });

  afterAll(() => {
    return dynamodb
      .deleteTable({
        TableName: storeName,
      })
      .promise();
  });

  describe('Store Events', () => {
    test('Stores a single event successfully', async () => {
      expect(isNone(await storeEvents([accountCreated], storeName))).toBeTruthy();
    });
  });

  describe('Get Aggregate Events', () => {
    test('Gets events successfully', async () => {
      expect(isRight(await getAggregateEvents(v4(), storeName))).toBeTruthy();
    });

    test('Returns item that has been stored', async () => {
      await storeEvents([accountCreated], storeName);
      const response = await getAggregateEvents(accountCreated.aggregateId, storeName);
      if (isRight(response)) {
        expect(response.right[0]).toStrictEqual({ ...accountCreated, ...{ TYPE: 'EVENT' } });
      } else {
        fail();
      }
    });

    test('Does not return items stored under different aggregate id', () => {
      storeEvents([accountCreated], storeName)
        .then(() =>
          getAggregateEvents(v4(), storeName)
            .then((response) => expect(isRight(response) && response.right.length == 0).toBeTruthy())
            .catch(() => fail()),
        )
        .catch(() => fail());
    });
  });

  describe('Get All Events', () => {
    test('Gets event successfully', async () => {
      getAllEvents(storeName).then((response) => expect(isRight(response)).toBeTruthy());
    });

    test('Returns item that has been stored', async () => {
      await storeEvents([accountCreated], storeName);
      const response = await getAllEvents(storeName);
      if (isRight(response)) {
        expect(response.right[0]).toStrictEqual({ ...accountCreated, ...{ TYPE: 'EVENT' } });
      } else {
        fail();
      }
    });

    test('Returns all items stored', async () => {
      await storeEvents([accountCreated, { ...accountCreated, ...{ aggregateId: v4() } }], storeName);
      const response = await getAllEvents(storeName);
      if (isRight(response)) {
        expect(response.right.length).toBe(2);
      } else {
        fail();
      }
    });
  });
});
