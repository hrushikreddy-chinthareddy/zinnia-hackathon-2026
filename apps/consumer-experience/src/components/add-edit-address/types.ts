import { AddressChange } from '@zinnia/api-types/types/bpm';
import { Address } from '@zinnia/api-types/types/sor';

export interface AddressObj {
  addressVal: string;
}

export interface AddressFormFields {
  addressType?: AddressChange.addressType;
  addresses?: AddressObj[];
  city?: string;
  state?: AddressChange.state;
  zipCode?: string;
  defaultAddress?: boolean;
}

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
  addresses?: Address[];
}
