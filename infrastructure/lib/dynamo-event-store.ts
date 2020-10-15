import * as core from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

export class DynamoEventStore extends core.Stack {
  eventStore: dynamodb.Table;

  constructor(scope: core.Construct, id: string) {
    super(scope, id);

    this.eventStore = new dynamodb.Table(this, 'EventStore', {
      partitionKey: {
        name: 'aggregateId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'aggregateVersion',
        type: dynamodb.AttributeType.NUMBER,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    this.eventStore.addGlobalSecondaryIndex({
      indexName: 'byEventId',
      partitionKey: {
        name: 'TYPE',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'eventId',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });
  }
}
