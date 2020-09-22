import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { v4 } from 'uuid';
import KSUID from 'ksuid';

import {
  Account,
  AccountCommands,
  AccountCreated,
  CreateAccount,
  DepositMoney,
  AccountEvent,
  MoneyDeposited,
} from './types';

function handleCreateAccount(account: Account, command: CreateAccount): Either<Error, AccountCreated> {
  if (account.version == 0) {
    return right({
      aggregateId: v4(),
      aggregateVersion: 1,
      eventId: KSUID.randomSync().string,
      eventType: 'ACCOUNT_CREATED',
      eventVersion: 1,
      metadata: { amount: 0, name: command.name },
    });
  } else {
    return left(new Error('Account already exists'));
  }
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

export function handle(account: Account, command: AccountCommands): Either<Error, AccountEvent[]> {
  if (CreateAccount.is(command)) {
    const response = handleCreateAccount(account, command);
    return isLeft(response) ? response : right([response.right]);
  } else {
    const response = handleDepositMoney(account, command);
    return isLeft(response) ? response : right([response.right]);
  }
}

function applyAccountCreated(event: AccountCreated): Account {
  return {
    name: event.metadata.name,
    aggregateId: event.aggregateId,
    amount: event.metadata.amount,
    version: event.aggregateVersion,
  };
}

function applyMoneyDeposited(account: Account, event: MoneyDeposited): Account {
  return { ...account, ...{ amount: account.amount ? account.amount + event.metadata.amount : event.metadata.amount } };
}

function apply(account: Account, event: AccountEvent): Account {
  if (AccountCreated.is(event)) {
    return applyAccountCreated(event);
  } else {
    return applyMoneyDeposited(account, event);
  }
}

export function hydrate(events: AccountEvent[]): Account {
  return events.reduce(apply, { version: 0 });
}
