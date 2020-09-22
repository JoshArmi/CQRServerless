import {
  Account,
  AccountCreated,
  CreateAccount,
  AccountEvent,
  DepositMoney,
  MoneyDeposited,
} from '../../src/entities/types';
import { handle, hydrate } from '../../src/entities/account';
import { isLeft, isRight, Either } from 'fp-ts/lib/Either';
import { v4 } from 'uuid';
import KSUID from 'ksuid';

describe('Create Accout Command', () => {
  const name = 'Josh';
  const command: CreateAccount = {
    name,
  };
  const account: Account = {
    version: 0,
  };
  const response = handle(account, command);

  test('Return only one event', () => {
    if (isRight(response)) {
      expect(response.right.length).toBe(1);
    } else {
      fail();
    }
  });

  test('Returns an Account Created event', () => {
    isRight(response) ? expect(AccountCreated.is(response.right[0])).toBeTruthy() : fail();
  });

  test('Returns an Account Created event with an Amount of 0', () => {
    isRight(response) ? expect(response.right[0].metadata.amount).toBe(0) : fail();
  });

  test('Returns an Account Created event with an Aggregate Version of 1', () => {
    isRight(response) ? expect(response.right[0].aggregateVersion).toBe(1) : fail();
  });

  test('Returns an Account Created event with an Aggregate Id', () => {
    isRight(response) ? expect(response.right[0].aggregateVersion).toBe(1) : fail();
  });

  test('Throws an error if passed an account that is not new', () => {
    expect(isLeft(handle({ version: 1 }, command))).toBeTruthy();
  });
});

describe('Deposit Money Command', () => {
  const name = 'Josh';
  const amount = 10;

  const event: AccountCreated = {
    aggregateId: v4(),
    aggregateVersion: 1,
    eventId: KSUID.randomSync().string,
    eventType: 'ACCOUNT_CREATED',
    eventVersion: 1,
    metadata: {
      amount: 0,
      name,
    },
  };
  const command: DepositMoney = {
    amount,
  };

  let response: Either<Error, AccountEvent[]>;
  beforeEach(() => {
    response = handle(hydrate([event]), command);
  });

  test('Return only one event', () => {
    isRight(response) ? expect(response.right.length).toBe(1) : fail();
  });

  test('Returns an MoneyDeposited event', () => {
    isRight(response) ? expect(MoneyDeposited.is(response.right[0])).toBeTruthy() : fail();
  });

  test('Event contains correct amount', () => {
    isRight(response) ? expect(response.right[0].metadata.amount).toBe(amount) : fail();
  });

  test('Returns error is no account created event', () => {
    expect(isLeft(handle(hydrate([]), command))).toBeTruthy();
  });
});

describe('Money Deposited Event', () => {
  const amount = 10;

  const event: MoneyDeposited = {
    aggregateId: v4(),
    aggregateVersion: 2,
    eventId: KSUID.randomSync().string,
    eventType: 'MONEY_DEPOSITED',
    eventVersion: 1,
    metadata: {
      amount,
    },
  };

  test('Handles event without error', () => {
    hydrate([event]);
  });

  test('Returns an account with the correct amount', () => {
    expect(hydrate([event]).amount).toBe(amount);
  });

  describe('Two events', () => {
    test('Returns a cumulative amount', () => {
      expect(hydrate([event, event]).amount).toBe(amount + amount);
    });
  });
});
