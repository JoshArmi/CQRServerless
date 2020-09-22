import { Event } from '../entities/types';
import { Either } from 'fp-ts/lib/Either';

export interface GetAggregateEvents {
    (aggregate_id: string, storeName: string): Promise<Either<Error, Event[]>>;
}

export interface GetAllEvents {
    (storeName: string): Promise<Either<Error, Event[]>>;
}
