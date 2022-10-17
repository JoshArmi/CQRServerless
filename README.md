# CQRServerless

An exploration of applying CQRS and Event Sourcing fully serverless on AWS.

This repository shows a variety of architectures for standing up CQRS systems, with a particular focus on how you can build an Event Store using AWS technologies.

For a primer on Event Sourcing and CQRS, see [this post](https://medium.com/contino-engineering/beginning-the-quest-for-serverless-cqrs-event-sourcing-8bfd5c9eb71e)

## 3 Key Functions of an Event Store

An Event Store, at a minimum, needs to provides 3 functions:

1. Store events
2. Get events for a given aggregate
3. Get all events from a particular offset

The implementation will, where possible, attempt to provide global ordering of events. However, they will all ensure that the storing of events is done with strong consistency.

## Implemented Patterns

### DynamoDB with KSUIDs

This implementation stores events with a partition key of the aggregate ID, and a sort key of aggregate version. This allows you to enforce that you do not write to events for the same aggregate with the same aggregate version.

The events are then replicated to a global secondary index, which has a partition key of `EVENT` and a sort key of the event ID, which is a [KSUID](https://github.com/segmentio/ksuid).

An example event as it exists in DynamoDB looks like:

```json
{
  "aggregateId": "4a009cfd-5ed5-4561-b654-53d812691cf2",
  "aggregateVersion": 1,
  "eventId": "2FyIfrDWHZuzu6E1oINDnTqSDky",
  "eventVersion": 1,
  "eventType": "ACCOUNT_CREATED",
  "TYPE": "EVENT"
  "metadata": {
    "name": "Josh Armitage"
  }
}
```

#### Tradeoffs

The current implementation will be throttled to approximately 1,000 writes per second on the global secondary index. This can be expanded by sharding the `TYPE` property to include more options, such as `EVENT_1, EVENT_2, EVENT_N`. Assuming write load is spread evenly, this would give you 1,000 writes per second per shard.

Additionally, the ordering is reliant on wall clock time from the writing Lambda function, so does run the risk of skewing, and potentially events inserted out of sequence. (Note this only effects reading all events, in aggregate consistency is guaranteed)

Lastly, global secondary indexes in DynamoDB are eventually consistent. This introduces potential data skew between getting all events, which is eventually consistent, and getting events for an aggregate, which is strongly consistent.

#### Conclusion

This architecture is the simplest for DynamoDB and works for getting familiar with event sourcing and CQRS, but the tradeoffs mean that production use is not advised. There's too many devils in the details that I wouldn't want to get woken up at 3am to fix.

## Unimplemented Patterns

### DynamoDB transactions

### Dual DynamoDB tables with single concurrency Lambda

### Dual DynamoDB tables with SQS FIFO

### Aurora Serverless

### Quantum Ledger
