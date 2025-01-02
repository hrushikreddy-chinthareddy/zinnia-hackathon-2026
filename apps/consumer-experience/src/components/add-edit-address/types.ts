import { AddressFormFields } from './form-steps/add/AddEditAddress';

export enum FormActionType {
  ADD = 'add',
  EDIT = 'edit',
}

export interface AddEditAddressSidesheetProps {
  partyId: string;
  values?: AddressFormFields;
  actionType: FormActionType;
}
