import { isNone, isSome } from "fp-ts/lib/Option";
import { commandHandler } from "../../src/entrypoints/createAccount"

const context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: '',
  functionVersion: '',
  invokedFunctionArn: '',
  logGroupName: '',
  memoryLimitInMB: '',
  awsRequestId: '',
  logStreamName: '',
  getRemainingTimeInMillis: () => 0,
  done: () => {},
  fail: () => {},
  succeed: () => {},
};


describe("Handle command", () => {
  beforeAll(() => {
    process.env.EVENT_STORE = "EventStore"
  })
  test("Accepts correct shape", async () => {
    expect(isNone(await commandHandler({"name": "Josh Armitage"}, context, () => {}))).toBeTruthy()
  })
  test("Rejects incorrect shape", async () => {
    expect(isSome(await commandHandler({"first_name": "Josh Armitage"}, context, () => {}))).toBeTruthy()
  })
  test("Fails without EVENT_STORE environment variable", async () => {
    delete process.env.EVENT_STORE
    expect(isSome(await commandHandler({"name": "Josh Armitage"}, context, () => {}))).toBeTruthy()
  })
})
