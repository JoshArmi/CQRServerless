import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { Either, isRight, left, right } from 'fp-ts/lib/Either';
import { isNone } from 'fp-ts/lib/Option';
import { v4 } from 'uuid';
import { getAggregateEvents, storeEvents } from '../drivers/event_dynamodb';
import { AccountCommands, CreateAccount } from '../entities/types';
import { createAccount } from '../usecases/account_commands';

function convert(event: APIGatewayProxyEventV2): Either<Error, AccountCommands> {
  if (event.body) {
    const body = JSON.parse(event.body);
    if (CreateAccount.is(body)) {
      console.log('Command is create account');
      return right(body);
    }
  }
  console.log('Event body is malformed');
  return left(new Error('Event body is malformed'));
}

export const handleCreateAccount = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(event);
  const storeName = process.env.STORE_NAME;
  if (!storeName) {
    throw new Error('STORE_NAME environment variable missing');
  }
  const command = convert(event);
  if (isRight(command) && CreateAccount.is(command.right)) {
    const aggregate_id = v4();
    const events = await getAggregateEvents(aggregate_id, storeName);
    if (isRight(events)) {
      console.log(events.right);
      const new_events = createAccount(events.right, command.right);
      if (isRight(new_events)) {
        console.log(new_events.right);
        const response = await storeEvents(new_events.right, storeName);
        return isNone(response) ? { statusCode: 200, body: '{"id":"' + aggregate_id + '"}' } : { statusCode: 500 };
      }
    }
  }
  return { statusCode: 400 };
};
