import { Either, isRight, left, right } from 'fp-ts/lib/Either';
import KSUID from 'ksuid';
import { v4 } from 'uuid';
import {
  Account,
  AccountCreated,
  AccountEvent, CreateAccount, DepositMoney, Event, MoneyDeposited
} from '../entities/types';

export function createAccount(command: CreateAccount): Event {
  return handleCreateAccount(command);
}

export function depositMoney(events: Event[], command: DepositMoney): Either<Error, Event> {
  const new_events = handleDepositMoney(hydrate(events), command);
  return isRight(new_events) ? right(new_events.right) : left(new_events.left);
}

function handleCreateAccount(command: CreateAccount): AccountCreated {
  return {
    aggregateId: v4(),
    aggregateVersion: 1,
    eventId: KSUID.randomSync().string,
    eventType: 'ACCOUNT_CREATED',
    eventVersion: 1,
    metadata: { name: command.name },
  };
}

function handleDepositMoney(account: Account, command: DepositMoney): Either<Error, MoneyDeposited> {
  if (account.aggregateId) {
    return right({
      ...account,
      ...{
        metadata: { amount: command.amount },
        aggregateVersion: account.version + 1,
        aggregateId: account.aggregateId,
        eventId: KSUID.randomSync().string,
        eventType: 'MONEY_DEPOSITED',
        eventVersion: 1,
      },
    });
  } else {
    return left(new Error('Account not found'));
  }
}

function applyAccountCreated(event: AccountCreated): Account {
  return {
    name: event.metadata.name,
    aggregateId: event.aggregateId,
    amount: 0,
    version: event.aggregateVersion,
  };
}

function applyMoneyDeposited(account: Account, event: MoneyDeposited): Account {
  return { ...account, ...{ amount: account.amount + event.metadata.amount } };
}

function apply(account: Account, event: AccountEvent): Account {
  if (AccountCreated.is(event)) {
    return applyAccountCreated(event);
  } else {
    return applyMoneyDeposited(account, event);
  }
}

function hydrate(events: AccountEvent[]): Account {
  return events.reduce(apply, { version: 0, amount: 0, aggregateId: "", name: ""});
}
