import { createAccount, depositMoney } from '../../src/usecases/account_commands';
import { isRight, isLeft } from 'fp-ts/lib/Either';
import { AccountCreated } from '../../src/entities/types';
import { v4 } from 'uuid';
import KSUID from 'ksuid';

const accountCreated: AccountCreated = {
  aggregateId: v4(),
  aggregateVersion: 1,
  eventId: KSUID.randomSync().string,
  eventType: 'ACCOUNT_CREATED',
  eventVersion: 1,
  metadata: {
    amount: 0,
    name: 'Josh',
  },
};

describe('Create Account', () => {
  test('Runs without error', () => {
    expect(isRight(createAccount([], { name: 'Josh' }))).toBeTruthy();
  });

  test('Returns error if aggregate already has events', () => {
    expect(isLeft(createAccount([accountCreated], { name: 'Josh' }))).toBeTruthy();
  });
});

describe('Deposit Moneu', () => {
  test('Runs without error', () => {
    expect(isRight(depositMoney([accountCreated], { amount: 10 }))).toBeTruthy();
  });

  test('Returns error if aggregate has no events', () => {
    expect(isLeft(depositMoney([], { amount: 10 }))).toBeTruthy();
  });
});
