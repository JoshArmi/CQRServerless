import * as t from 'io-ts';

export const Account = t.type({
  version: t.number,
  aggregateId: t.string,
  name: t.string,
  amount: t.number,
});
export type Account = t.TypeOf<typeof Account>;
export const CreateAccount = t.type(
  {
    name: t.string,
  },
  'CreateAccount',
);
export type CreateAccount = t.TypeOf<typeof CreateAccount>;
export const DepositMoney = t.type(
  {
    amount: t.number,
  },
  'DepositMoney',
);
export type DepositMoney = t.TypeOf<typeof DepositMoney>;

export type AccountCommands = CreateAccount | DepositMoney;

export type Command = AccountCommands;

export const BaseEvent = t.type(
  {
    aggregateId: t.string,
    aggregateVersion: t.number,
    eventId: t.string,
    eventVersion: t.number,
  },
  'BaseEvent',
);

export const AccountCreated = t.intersection([
  t.type(
    {
      eventType: t.literal('ACCOUNT_CREATED'),
      metadata: t.type({
        name: t.string,
      }),
    },
    'AccountCreated',
  ),
  BaseEvent,
]);
export type AccountCreated = t.TypeOf<typeof AccountCreated>;

export const MoneyDeposited = t.intersection([
  t.type(
    {
      eventType: t.literal('MONEY_DEPOSITED'),
      metadata: t.type({
        amount: t.number,
      }),
    },
    'MoneyDesposited',
  ),
  BaseEvent,
]);
export type MoneyDeposited = t.TypeOf<typeof MoneyDeposited>;

export const AccountEvent = t.union([AccountCreated, MoneyDeposited]);
export type AccountEvent = t.TypeOf<typeof AccountEvent>;

export const Event = t.union([AccountCreated, MoneyDeposited]);
export type Event = t.TypeOf<typeof Event>;

export type Aggregate = t.TypeOf<typeof Account>;
