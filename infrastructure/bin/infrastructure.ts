#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import 'source-map-support/register';
import { Account } from '../lib/account-domain';
import { AuroraEventStore } from '../lib/aurora-event-store';
import { DynamoEventStore } from '../lib/dynamo-event-store';
import { Migrator } from '../lib/migrator';
import { Network } from '../lib/network';

const app = new cdk.App();
const eventStore = new DynamoEventStore(app, 'EventStore');
const network = new Network(app, 'Network');
new Account(app, 'Account', { eventStore: eventStore.eventStore });
new AuroraEventStore(app, 'AuroraEventStore', network.vpc);
new Migrator(app, 'Migrator', network.vpc);
