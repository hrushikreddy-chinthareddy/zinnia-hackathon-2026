import { TFunction } from "next-i18next";

import { FormValidationErrors } from "@deps/models/case/withdrawal/case";
import { PartyType } from "@deps/models/policy/sor-policy";

export const validateBeneData = ( beneData: any, t: TFunction) => {
    const errors = {} as FormValidationErrors;
    let firstNameErrors: number = 0;
    let addressErrors: number = 0;

    beneData.map((item: any) => {
        if (['ADD', 'UPDATE'].includes(item.action) ) {
            const { partyType } = item.party.info;
            const address = item.party.addresses?.[0] || {};
            if (partyType === PartyType.INDIVIDUAL) {
                if (!item?.party?.info?.firstName) {
                    firstNameErrors++;
                }
            }

            if (partyType === PartyType.ORGANIZATION || partyType === PartyType.TRUST) {
                if (!item?.party?.info?.lastName) {
                    firstNameErrors++;
                }
            }

            if (address.addressLine1 || address.addressLine2) {
                if (!address.zipCode) {
                    addressErrors++;
                }
                if (!address.state) {
                    addressErrors++;
                }
                if (!address.city) {
                    addressErrors++
                }
            }
        }
    });

    if (firstNameErrors > 0) {
        errors['firstNamesRequired'] = t('formValidations.firstNames');
    }
    if (addressErrors > 0) {
        errors['addressesRequired'] = t('formValidations.addressDetails');
    }

    return errors;
};