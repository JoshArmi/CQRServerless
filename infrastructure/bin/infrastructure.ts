#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Account } from '../lib/account-domain';
import { EventStore } from '../lib/event-store';

const app = new cdk.App();
const eventStore = new EventStore(app, 'EventStore');
new Account(app, 'Account', { eventStore: eventStore.eventStore });
