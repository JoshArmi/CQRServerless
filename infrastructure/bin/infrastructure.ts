#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Account } from '../lib/account-domain';
import { DynamoEventStore } from '../lib/dynamo-event-store';
import { AuroraEventStore } from '../lib/aurora-event-store';

const app = new cdk.App();
const eventStore = new DynamoEventStore(app, 'EventStore');
new Account(app, 'Account', { eventStore: eventStore.eventStore });
new AuroraEventStore(app, 'AuroraEventStore');
