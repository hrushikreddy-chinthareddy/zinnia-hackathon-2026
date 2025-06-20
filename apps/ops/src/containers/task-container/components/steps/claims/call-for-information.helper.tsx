import { Phone } from '@xd/api-types/dist/generated-types/sor';
import { countries } from 'countries-list';


import { ClaimCommunicationTypes } from '@deps/containers/death-claim-container/death-claim.types';
import { validateEmail, validateFax } from '@deps/containers/death-claim-container/steps/notification-method/notification-method.helpers';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import { CallLog, ChangeTypeEnum, ContactRole, UpdatedBeneficiaryRecord } from "./claims.type";


export function updateCallLogs(task: any, dynamicKey: string, callEntriesLength: number, contactRole: string, name: string, phone: Phone, country: keyof typeof countries, relationshipToOwner: string) {
  const updatedTask = { ...task };

  if (!updatedTask.data.details[dynamicKey].callLogs) {
    updatedTask.data.details[dynamicKey].callLogs = [];
  }

  const callLogs = updatedTask.data.details[dynamicKey].callLogs;

  const logIndex = callLogs.findIndex(
    (log: CallLog) =>
      log.fullName === name &&
      (contactRole === ContactRole.AGENT ? log.partyRoleCategory === ContactRole.AGENT : log.partyRole === contactRole)
  );

  if (logIndex !== -1 && contactRole !== ContactRole.OTHER) {
    callLogs[logIndex] = {
      ...callLogs[logIndex],
      callSequence: callEntriesLength + 1,
      callDone: true,
    };
  } else {
    if (contactRole === ContactRole.OTHER) {
      callLogs.push({
        fullName: name,
        partyRole: contactRole,
        callSequence: callEntriesLength + 1,
        phone: { ...phone, countryCode: countries[country].phone },
        partyRoleCategory: contactRole,
        relationshipToInsured: relationshipToOwner,
        callDone: true,
      });
    }
  }

  return updatedTask;
}


export const validateForm = (dynamicKey: string, contactRole: ContactRole | string, phone: Phone, name: string, beneficiary: UpdatedBeneficiaryRecord, setFormErrors: (errors: FormValidationErrors) => void, relationshipToOwner: string, addressSelected: boolean) => {
  const errors: FormValidationErrors = {};

  if (dynamicKey !== 'benefinalcontactattempt') {
    if (!contactRole || !phone.dialNumber || !name) {
      errors['mandatoryField'] = "Missing contactRole or phone or name or changeType ";
    }
  }

  if (contactRole) {
    if (!phone.dialNumber || !name || beneficiary.changeRequire === null) {
      errors['mandatoryField'] = "Missing phone or name";
    }

  }

  if (contactRole === ContactRole.OTHER && !relationshipToOwner) {
    errors['mandatoryField'] = "Missing relationshipToOwner";
  }

  if (beneficiary.changeRequire && !beneficiary.changeType) {
    errors['mandatoryField'] = "Missing changeType";
  }

  if (beneficiary.changeType === ChangeTypeEnum.BENEFICIARY_NOTIFICATION_CHANGE) {
    if (beneficiary.notificationPreferences.notificationMethod.method === ClaimCommunicationTypes.Email && !beneficiary.notificationPreferences.email?.emailAddress) {
      errors['mandatoryField'] = "Missing emailAddress";
    }
    if (beneficiary.notificationPreferences.notificationMethod.method === ClaimCommunicationTypes.Fax && !beneficiary.notificationPreferences.fax?.faxNumber) {
      errors['mandatoryField'] = "Missing faxNumber";
    }
    if (beneficiary.notificationPreferences.notificationMethod.method === ClaimCommunicationTypes.Mail && !addressSelected) {
      errors['mandatoryField'] = "Missing addressLine1 or city or state or zipCode";
    }
    if (beneficiary.notificationPreferences.notificationMethod.method === ClaimCommunicationTypes.Email && beneficiary.notificationPreferences.email?.emailAddress) {
      const emailError = validateEmail(beneficiary.notificationPreferences.email.emailAddress);
      if (emailError) {
        errors['emailValidation'] = emailError;
      }
    }
    if (beneficiary.notificationPreferences.notificationMethod.method === ClaimCommunicationTypes.Fax && beneficiary.notificationPreferences.fax?.faxNumber) {
      const faxError = validateFax(beneficiary.notificationPreferences.fax.faxNumber);
      if (faxError) {
        errors['faxValidation'] = faxError;
      }
    }

  }
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};