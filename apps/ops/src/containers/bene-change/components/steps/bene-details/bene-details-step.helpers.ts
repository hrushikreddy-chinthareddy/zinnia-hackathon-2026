import { TFunction } from 'next-i18next';

import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import {
    PartyType,
    PartyRole,
    PreferredCommunicationType,
} from '@zinnia/api-types/types/sor';

export const validateBeneData = (
    beneData: any,
    t: TFunction,
    t1: TFunction
) => {
    const errors = {} as FormValidationErrors;
    let firstNameErrors: number = 0;
    let addressErrors: number = 0;
    let emailErrors: number = 0;
    let allocationErrors: number = 0;
    let relationshipErrors: number = 0;

    beneData.map((item: any) => {
        if (['ADD', 'UPDATE'].includes(item.action)) {
            const { partyType } = item.party.info;
            const address = item.party.addresses?.[0] || {};
            const allocationPercentage =
                item?.party?.allocation?.beneficiaryPercentage ?? 0;

            const relationshipToParty =
                item?.party?.allocation?.relationshipToParty ?? '';

            const preferredCommunicationType =
                item?.party?.preferredCommunicationType;

            if (
                preferredCommunicationType ===
                PreferredCommunicationType.REGULARMAIL
            ) {
                if (!address.addressLine1 || !address.addressLine1.trim()) {
                    addressErrors++;
                }
                if (address.addressLine1 || address.addressLine2) {
                    if (!address.zipCode) {
                        addressErrors++;
                    }
                    if (!address.state) {
                        addressErrors++;
                    }
                    if (!address.city) {
                        addressErrors++;
                    }
                }
            }

            if (
                preferredCommunicationType === PreferredCommunicationType.EMAIL
            ) {
                const email = item.party.emails?.[0]?.emailAddress || '';
                if (!email || !email.trim()) {
                    emailErrors++;
                }
            }

            if (partyType === PartyType.INDIVIDUAL) {
                if (
                    !item?.party?.info?.firstName?.trim() ||
                    !item?.party?.info?.lastName?.trim()
                ) {
                    firstNameErrors++;
                }
            }

            if (!(Number(allocationPercentage) > 0)) {
                allocationErrors++;
            }

            if (
                partyType === PartyType.ORGANIZATION ||
                partyType === PartyType.TRUST
            ) {
                if (!item?.party?.info?.lastName) {
                    firstNameErrors++;
                }
            }

            if (!relationshipToParty) {
                relationshipErrors++;
            }
        }
    });

    if (firstNameErrors > 0) {
        errors['firstNamesRequired'] = t('formValidations.firstNames');
    }
    if (addressErrors > 0) {
        errors['addressesRequired'] = t('formValidations.addressDetails');
    }
    if (emailErrors > 0) {
        errors['emailRequired'] = t1('formValidationsEmail');
    }
    if (allocationErrors > 0) {
        errors['allocationRequired'] = t('formValidations.allocationRequired');
    }
    if (relationshipErrors > 0) {
        errors['relationshipRequired'] = t(
            'formValidations.relationshipToParty'
        );
    }

    const result = validateBeneficiaryPercentages(beneData);

    if (!result.PRIMARYBENEFICIARY.isValid) {
        errors['primaryBeneficiaryAllocationsSum'] = t(
            'formValidations.primaryBeneficiaryAllocationsSum'
        );
    }
    if (!result.CONTINGENTBENEFICIARY.isValid) {
        errors['contingentBeneficiaryAllocationsSum'] = t(
            'formValidations.contingentBeneficiaryAllocationsSum'
        );
    }

    return errors;
};

function validateBeneficiaryPercentages(data: any) {
    type BeneficiaryRole =
        | PartyRole.PRIMARYBENEFICIARY
        | PartyRole.CONTINGENTBENEFICIARY;
    const grouped: Record<BeneficiaryRole, any[]> = {
        PRIMARYBENEFICIARY: [],
        CONTINGENTBENEFICIARY: [],
    };

    for (const item of data) {
        const role = item.partyRole?.partyRole as BeneficiaryRole;
        if (
            (role === PartyRole.PRIMARYBENEFICIARY ||
                role === PartyRole.CONTINGENTBENEFICIARY) &&
            item.action !== 'DELETE'
        ) {
            grouped[role].push(item);
        }
    }

    const result: Record<
        BeneficiaryRole,
        { totalPercentage: number; isValid: boolean }
    > = {
        PRIMARYBENEFICIARY: { totalPercentage: 0, isValid: true },
        CONTINGENTBENEFICIARY: { totalPercentage: 0, isValid: true },
    };

    (Object.keys(grouped) as BeneficiaryRole[]).forEach((role) => {
        const items = grouped[role];
        if (items.length > 0) {
            const total = items.reduce((sum, item) => {
                return (
                    sum + (item.party?.allocation?.beneficiaryPercentage || 0)
                );
            }, 0);

            result[role] = {
                totalPercentage: total,
                isValid: total === 100,
            };
        } else {
            result[role] = {
                totalPercentage: 0,
                isValid: true,
            };
        }
    });

    return result;
}
