import * as AWS from 'aws-sdk';
import { isRight } from 'fp-ts/lib/Either';
import { isNone, isSome } from 'fp-ts/lib/Option';
import { v4 } from 'uuid';
import { getAggregateEvents, getAllEvents, storeEvents } from '../../src/drivers/event_dynamodb_ksuid';
import { AccountCreated } from '../../src/entities/types';
import KSUID from 'ksuid';

const accountCreated = (): AccountCreated => {
  return {
    aggregateId: v4(),
    aggregateVersion: 1,
    eventId: KSUID.randomSync().string,
    eventType: 'ACCOUNT_CREATED',
    eventVersion: 1,
    metadata: {
      name: 'Josh',
    },
  };
};

const dynamodb = new AWS.DynamoDB.DocumentClient();

const storeName = 'EventStore';

describe('DynamoDB Driver', () => {
  beforeEach(async () => {
    const items = (await dynamodb.scan({ TableName: storeName }).promise()).Items;
    if (items) {
      items.forEach(async (item) => {
        await dynamodb
          .delete({
            TableName: storeName,
            Key: { aggregateId: item.aggregateId, aggregateVersion: item.aggregateVersion },
          })
          .promise();
      });
    }
  });

  describe('Store Events', () => {
    test('Stores a single event successfully', async () => {
      expect(isNone(await storeEvents([accountCreated()], storeName))).toBeTruthy();
    });

    test('Stores multiple events successfully', async () => {
      const event = accountCreated();
      expect(
        isNone(
          await storeEvents(
            [event, { ...event, ...{ aggregateVersion: 2, eventId: KSUID.randomSync().string } }],
            storeName,
          ),
        ),
      ).toBeTruthy();
    });

    test('Rejects two events with same aggregate version stored together', async () => {
      const event = accountCreated();
      expect(
        isSome(await storeEvents([event, { ...event, ...{ eventId: KSUID.randomSync().string } }], storeName)),
      ).toBeTruthy();
    });

    test('Rejects two events with same aggregate version stored separately', async () => {
      const event = accountCreated();
      await storeEvents([event], storeName);
      expect(
        isSome(await storeEvents([{ ...event, ...{ eventId: KSUID.randomSync().string } }], storeName)),
      ).toBeTruthy();
    });
  });

  describe('Get Aggregate Events', () => {
    test('Gets events successfully', async () => {
      expect(isRight(await getAggregateEvents(v4(), storeName))).toBeTruthy();
    });

    test('Returns item that has been stored', async () => {
      const event = accountCreated();
      await storeEvents([event], storeName);
      const response = await getAggregateEvents(event.aggregateId, storeName);
      if (isRight(response)) {
        expect(response.right[0]).toStrictEqual({ ...event, ...{ TYPE: 'EVENT' } });
      } else {
        fail();
      }
    });

    test('Does not return items stored under different aggregate id', () => {
      const event = accountCreated();
      storeEvents([event], storeName)
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
      const event = accountCreated();
      await storeEvents([event], storeName);
      const response = await getAllEvents(storeName);
      if (isRight(response)) {
        expect(response.right[0]).toStrictEqual({ ...event, ...{ TYPE: 'EVENT' } });
      } else {
        fail();
      }
    });

    test('Returns all items stored', async () => {
      const event = accountCreated();
      await storeEvents([event, { ...event, ...{ aggregateId: v4() } }], storeName);
      const response = await getAllEvents(storeName);
      if (isRight(response)) {
        expect(response.right.length).toBe(2);
      } else {
        fail();
      }
    });

    test('Filters malformed event in table', async () => {
      await dynamodb
        .put({
          TableName: storeName,
          Item: {
            aggregateId: v4(),
            aggregateVersion: 10,
            TYPE: 'EVENT',
            eventId: v4(),
          },
        })
        .promise();
      const response = await getAllEvents(storeName);
      if (isRight(response)) {
        expect(response.right.length).toBe(0);
      } else {
        fail();
      }
    });
  });
});
