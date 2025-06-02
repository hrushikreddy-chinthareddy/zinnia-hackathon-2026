import { Transaction } from '@zinnia/api-types/types/sor';

export type Charge = Required<Transaction>['charges'][number];
export type PayeeOrBeneficiary = Required<Transaction>['payeeOrBeneficiaries'][number];
export type Payor = Required<Transaction>['payors'][number];
