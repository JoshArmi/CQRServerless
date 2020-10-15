import * as core from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

type AccountProps = {
  eventStore: dynamodb.Table;
};

export class Account extends core.Stack {
  constructor(scope: core.Construct, id: string, props: AccountProps) {
    super(scope, id);
    const createAccount = new lambda.Function(this, 'CreateAccount', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('../build'),
      handler: 'createAccount.handleCreateAccount',
      environment: {
        STORE_NAME: props.eventStore.tableName,
      },
    });

    props.eventStore.grantReadWriteData(createAccount);
  }
}
