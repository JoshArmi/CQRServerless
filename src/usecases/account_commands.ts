import { handle, hydrate } from '../entities/account';
import { Either, isRight, left, right } from 'fp-ts/lib/Either';
import { CreateAccount, DepositMoney, Event } from '../entities/types';

export function createAccount(events: Event[], command: CreateAccount): Either<Error, Event[]> {
  const new_events = handle(hydrate(events), command);
  return isRight(new_events) ? right(new_events.right) : left(new_events.left);
}

export function depositMoney(events: Event[], command: DepositMoney): Either<Error, Event[]> {
  const new_events = handle(hydrate(events), command);
  return isRight(new_events) ? right(new_events.right) : left(new_events.left);
}
