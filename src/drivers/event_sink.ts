import { Option } from 'fp-ts/lib/Option';
import { Event } from '../entities/types';

export interface StoreEvents {
    (events: Event[], storeName: string): Promise<Option<Error>>;
}
