import * as core from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

export class Network extends core.Stack {
  vpc: ec2.IVpc;

  constructor(scope: core.Construct, id: string) {
    super(scope, id);
    this.vpc = new ec2.Vpc(this, 'vpc');
  }
}
