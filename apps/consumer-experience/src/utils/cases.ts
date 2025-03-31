import { CaseTypes } from '@/types/case';

export const caseTypesToProccessSubtype: {
  [key in CaseTypes]: string;
} = {
  [CaseTypes.ADDRESS_CHANGE]: 'Address Change',
  [CaseTypes.BANK_INFO_CHANGE]: 'Bank Info Change',
  [CaseTypes.PHONE_CHANGE]: 'Phone Change',
  [CaseTypes.BENEFICIARY_CHANGE]: 'Beneficiary Change',
  [CaseTypes.COMMUNICATION_PREFERENCE_CHANGE]:
    'Communication Preference Change',
};
