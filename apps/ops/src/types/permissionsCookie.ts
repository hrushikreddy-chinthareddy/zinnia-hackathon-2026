import { isHttpsEnvironment } from '@deps/utils/environment.helper';

// The __Host- prepend requires an https environmenet
export const PERMISSIONS_COOKIE_NAME = `${isHttpsEnvironment() ? '__Host-' : ''}fga-permissions`;

export const DEFAULT_PERMISSIONS_COOKIE = '{"tuples":{},"carriers":{}}';

type Relation = string; // a tuples relation
type TupleObject = string; // a tuples object
export interface PermissionsCookie {
    tuples: {
        [key: Relation]: {
            [key: TupleObject]: boolean;
        };
    };
    carriers: {
        [key: Relation]: string[];
    };
}

// determines if a user has a specific permission.  Will also check if permisisonsObject has the relation at the carrier level via a previous list carriers call
export type HasPermission = (relation: Relation, object: TupleObject, carrierCode?: string) => Promise<boolean>;
export type ListCarriers = (relation: Relation) => Promise<string[]>;
