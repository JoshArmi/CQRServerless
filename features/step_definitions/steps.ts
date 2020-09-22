import * as aws from 'aws-sdk';
import { BeforeAll, Given, Then, When } from 'cucumber';

let lambda: aws.Lambda;

const findLambdaName = async (cfn: aws.CloudFormation, functionName: string): string => { };

BeforeAll(() => {
  lambda = new aws.Lambda();
  this.createAccount = findLambdaName(new aws.CloudFormation(), 'CreateAccount');
});

Given('Josh is creating an account', function () {
  this.payload = {
    name: 'Josh',
  };
});

When('He creates an account', function () {
  lambda.invoke();
});

Then('the account is created', function () { });
