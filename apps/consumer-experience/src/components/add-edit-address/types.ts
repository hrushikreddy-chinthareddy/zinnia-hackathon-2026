import { Address } from '@zinnia/api-types/types/sor';

import { AddressFormFields } from './form-steps/add/AddEditAddress';

export enum FormActionType {
  ADD = 'add',
  EDIT = 'edit',
}

export interface AddEditAddressSidesheetProps {
  partyId: string;
  fullAddressData?: Address;
  values?: AddressFormFields;
  actionType: FormActionType;
  addressId?: string;
  disableEditingPreferredAddress?: boolean;
}
