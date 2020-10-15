import { Either } from 'fp-ts/lib/Either';
import { Option } from 'fp-ts/lib/Option';
import * as t from 'io-ts';
import { Event } from '../entities/types';
import { StoreEvents } from './event_sink';
import { GetAggregateEvents, GetAllEvents } from './event_source';

export const storeEvents: StoreEvents = async (events: Event[], storeName: string): Promise<Option<Error>> => { };

export const getAggregateEvents: GetAggregateEvents = (
  aggregate_id: string,
  storeName: string,
): Promise<Either<Error, Event[]>> => { };

export const getAllEvents: GetAllEvents = (storeName: string): Promise<Either<Error, Event[]>> => { };
