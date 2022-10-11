import { isLeft, isRight } from 'fp-ts/lib/Either';
import KSUID from 'ksuid';
import { v4 } from 'uuid';
import { AccountCreated, MoneyDeposited } from '../../src/entities/types';
import { createAccount, depositMoney } from '../../src/usecases/account';

const accountCreated: AccountCreated = {
  aggregateId: v4(),
  aggregateVersion: 1,
  eventId: KSUID.randomSync().string,
  eventType: 'ACCOUNT_CREATED',
  eventVersion: 1,
  metadata: {
    name: 'Josh',
  },
};

const moneyDeposited: MoneyDeposited = {
  aggregateId: v4(),
  aggregateVersion: 2,
  eventId: KSUID.randomSync().string,
  eventType: 'MONEY_DEPOSITED',
  eventVersion: 1,
  metadata: {
    amount: 15,
  },
};

describe('Create Account', () => {
  test('Runs without error', () => {
    createAccount({ name: 'Josh' });
  });
});

describe('Deposit Money', () => {
  test('Runs without error', () => {
    expect(isRight(depositMoney([accountCreated], { amount: 10 }))).toBeTruthy();
  });

  test('Accepts multiple deposits', () => {
    expect(isRight(depositMoney([accountCreated, moneyDeposited], { amount: 10 }))).toBeTruthy();
  });

  test('Returns error if aggregate has no events', () => {
    expect(isLeft(depositMoney([], { amount: 10 }))).toBeTruthy();
  });
});
