import * as core from '@aws-cdk/core';
import * as aurora from '@aws-cdk/aws-rds';
import * as ec2 from '@aws-cdk/aws-ec2';

export class AuroraEventStore extends core.Stack {
  constructor(scope: core.Construct, id: string, vpc: ec2.IVpc) {
    super(scope, id);

    new aurora.ServerlessCluster(this, 'EventStore', {
      engine: aurora.DatabaseClusterEngine.auroraPostgres({ version: aurora.AuroraPostgresEngineVersion.VER_10_7 }),
      vpc,
    });
  }
}
