import { Context, Handler } from "aws-lambda";
import { Option, some } from "fp-ts/lib/Option";
import { storeEvents } from "../drivers/event_dynamodb";
import { CreateAccount } from "../entities/types";
import { createAccount } from "../usecases/account";

export const commandHandler: Handler = async (event: any, _: Context): Promise<Option<Error>> => {
  if (CreateAccount.is(event)) {
    const accountCreated = createAccount(event)
    return(await storeEvents([accountCreated], process.env.EVENT_STORE!))
  } else {
    return some(Error("Event is not a Create Account command"));
  }
}
