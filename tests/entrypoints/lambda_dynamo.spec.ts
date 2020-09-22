import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { handleCreateAccount } from '../../src/entrypoints/lambda_dynamo';

AWS.config.update({
  region: 'eu-west-1',
  dynamodb: {
    endpoint: 'http://localhost:4566',
  },
});

const baseEvent: APIGatewayProxyEventV2 = {
  version: '',
  headers: {},
  routeKey: '',
  rawPath: '',
  rawQueryString: '',
  requestContext: {
    accountId: '111111111111',
    apiId: '',
    domainName: '',
    domainPrefix: '',
    http: {
      method: '',
      path: '',
      protocol: '',
      sourceIp: '',
      userAgent: '',
    },
    requestId: '',
    routeKey: '',
    stage: '',
    time: '',
    timeEpoch: 0,
  },
  isBase64Encoded: false,
};

const dynamodb = new AWS.DynamoDB();
const STORE_NAME = 'EntrypointTest';

beforeAll(() => {
  process.env.STORE_NAME = STORE_NAME;
  const params: AWS.DynamoDB.CreateTableInput = {
    AttributeDefinitions: [
      {
        AttributeName: 'eventId',
        AttributeType: 'S',
      },
      {
        AttributeName: 'aggregateId',
        AttributeType: 'S',
      },
      {
        AttributeName: 'aggregateVersion',
        AttributeType: 'N',
      },
      {
        AttributeName: 'TYPE',
        AttributeType: 'S',
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
    KeySchema: [
      {
        AttributeName: 'aggregateId',
        KeyType: 'HASH',
      },
      {
        AttributeName: 'aggregateVersion',
        KeyType: 'RANGE',
      },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'byEventId',
        KeySchema: [
          {
            AttributeName: 'TYPE',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'eventId',
            KeyType: 'RANGE',
          },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
      },
    ],
    TableName: process.env.STORE_NAME,
  };
  return dynamodb.createTable(params).promise();
});

afterAll(() => {
  return dynamodb
    .deleteTable({
      TableName: STORE_NAME,
    })
    .promise();
});

describe('Create Account', () => {
  let response: APIGatewayProxyStructuredResultV2;
  beforeAll(async () => {
    response = await handleCreateAccount({ ...baseEvent, ...{ body: '{"name": "Josh"}' } });
  });
  test('Returns 200 response', () => {
    expect(response.statusCode).toBe(200);
  });

  test('Returns a body', () => {
    expect(response.body).toBeDefined();
  });

  test('Returns JSON in the body', () => {
    response.body ? JSON.parse(response.body) : fail();
  });

  test('Returns an id field in the body', () => {
    response.body ? expect('id' in JSON.parse(response.body)).toBeTruthy() : fail();
  });

  describe('Given bad command', () => {
    beforeAll(async () => {
      response = await handleCreateAccount({ ...baseEvent, ...{ body: '{"first_name": "Josh"}' } });
    });
    test('Returns a 400 response', () => {
      expect(response.statusCode).toBe(400);
    });
  });

  describe('Enviroment variables', () => {
    test('Throws error if no STORE_NAME', async () => {
      delete process.env.STORE_NAME;
      await expect(handleCreateAccount(baseEvent)).rejects.toThrow();
    });
  });
});
