import { Given, Then, When } from '@cucumber/cucumber';
import assert from 'assert';
import * as aws from 'aws-sdk';
import { isSome, none, Option, some } from "fp-ts/lib/Option";

const lambda = new aws.Lambda();

const findLambdaName = async (cfn: aws.CloudFormation, outputName: string): Promise<Option<string>> => { 
  var lambdaName = ""
  const stacks = await cfn.describeStacks().promise()
  stacks.Stacks!.forEach(stack => {
    if (stack.StackName == "CQRServerless") {
      const outputs = stack.Outputs!
      outputs.forEach(output => {
        if (output.OutputKey!.indexOf(outputName) >= 0) {
          lambdaName = output.OutputValue!
        }
      })
    }
  })
  return lambdaName ? some(lambdaName) : none
};

Given('a user {string}', function (name) {
  this.payload = {
    name,
  };
});

When('she registers', async function () {
  const createAccount = await findLambdaName(new aws.CloudFormation(), 'CreateAccount')
  if (isSome(createAccount)) {
    this.response = await lambda.invokeAsync({
      FunctionName: createAccount.value,
      InvokeArgs: JSON.stringify(this.payload)
    }).promise()
  } else {
    throw Error("Could not find Create Account Lambda")
  }
});

Then('her account is created', function () {
  assert.notStrictEqual(this.response, { Status: 202 })
 });
