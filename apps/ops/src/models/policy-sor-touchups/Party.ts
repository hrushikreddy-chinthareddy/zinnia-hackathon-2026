import { Policy } from '@zinnia/api-types/types/sor';

export type Party = Required<Policy>['parties'][number];
