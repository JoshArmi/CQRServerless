import * as core from '@aws-cdk/core';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as ec2 from '@aws-cdk/aws-ec2';

export class Migrator extends core.Stack {
  constructor(scope: core.Construct, id: string, vpc: ec2.IVpc) {
    super(scope, id);

    const source = codebuild.Source.gitHub({
      owner: 'JoshArmi',
      repo: 'CQRServerless',
    });

    new codebuild.Project(this, 'Migrator', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: ['docker run flyway/flyway info'],
          },
        },
      }),
      environment: {
        privileged: true,
      },
      source,
      vpc: vpc,
    });
  }
}
