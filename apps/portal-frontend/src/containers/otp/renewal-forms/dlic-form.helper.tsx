import { TFunction } from 'next-i18next';

import { SignaturesConfig } from '@deps/components/otp-renewal-form/signature-validation/signature-validation';
import { SignatureFields } from '@deps/components/otp-renewal-form/signature-validation/single-signature';
import { PartyFields } from '@deps/components/otp-withdrawal-form/form-party/party-helper';
import { RadioItem } from '@deps/components/radio/radio';
import { getTrasanctionsByIds, TransactionTypes } from '@deps/helpers/transaction-options.helper';
import { Channel, RenewalPeriod } from '@deps/models/case/renewal/case-renewal';
import { renewalsFormParts } from '@deps/models/case/task';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

export interface OwnerConfig {
    partyRoleType: string;
    title: string;
    fields: {
        fieldName: PartyFields;
        fieldLabel: string;
    }[];
}

export default function getDlicConfig(t: TFunction) {
    // validations
    const formValidation = ({
        subsequentTargetFunds,
        channel,
        renewalRequestSignDate,
    }: Partial<renewalsFormParts> = {}): FormValidationErrors => {
        const errors = {} as FormValidationErrors;

        const period = subsequentTargetFunds?.reduce((accumulator, object) => {
            return accumulator + Number(object.value);
        }, 0);

        if (period !== 100) {
            errors['period'] = t('renewalPeriodError');
        }

        // channel should be call
        if (channel === Channel.Phone && !renewalRequestSignDate) {
            errors['callReceivedDate'] = t('callReceivedDateError');
        }

        return errors;
    };

    const formPartyConfigs: OwnerConfig[] = [
        {
            partyRoleType: 'Primary',
            title: t('primaryOwner'),
            fields: [
                {
                    fieldName: PartyFields.FirstName,
                    fieldLabel: t('firstName'),
                },
                {
                    fieldName: PartyFields.MiddleName,
                    fieldLabel: t('middleName'),
                },
                {
                    fieldName: PartyFields.LastName,
                    fieldLabel: t('lastName'),
                },
            ],
        },
        {
            partyRoleType: 'Joint',
            title: t('jointOwner'),
            fields: [
                {
                    fieldName: PartyFields.FirstName,
                    fieldLabel: t('firstName'),
                },
                {
                    fieldName: PartyFields.MiddleName,
                    fieldLabel: t('middleName'),
                },
                {
                    fieldName: PartyFields.LastName,
                    fieldLabel: t('lastName'),
                },
            ],
        },
    ];

    const signatureConfigs: SignaturesConfig[] = [
        {
            signatureType: 'Primary',
            fields: [
                {
                    fieldName: SignatureFields.SignatureType,
                    fieldLabel: t('type'),
                },
                {
                    fieldName: SignatureFields.Name,
                    fieldLabel: t('printedName'),
                },

                {
                    fieldName: SignatureFields.SignaturePresent,
                    fieldLabel: t('signPresent'),
                },
                {
                    fieldName: SignatureFields.SignatureDate,
                    fieldLabel: t('date'),
                },
            ],
        },
        {
            signatureType: 'Joint',
            fields: [
                {
                    fieldName: SignatureFields.SignatureType,
                    fieldLabel: t('type'),
                },
                {
                    fieldName: SignatureFields.Name,
                    fieldLabel: t('printedName'),
                },

                {
                    fieldName: SignatureFields.SignaturePresent,
                    fieldLabel: t('signPresent'),
                },
                {
                    fieldName: SignatureFields.SignatureDate,
                    fieldLabel: t('date'),
                },
            ],
        },
    ];

    const periodRadioItems: RadioItem[] = [
        { label: t('periodLabel', { year: 3 }), value: RenewalPeriod.ThreeYear },
        { label: t('periodLabel', { year: 5 }), value: RenewalPeriod.FiveYear },
        { label: t('periodLabel', { year: 7 }), value: RenewalPeriod.SevenYear },
    ];

    // CMW-19673 for delaware renewal we need only percentage option as per paper form
    const transList = getTrasanctionsByIds([TransactionTypes.Percentage]);

    return {
        formPartyConfigs,
        signatureConfigs,
        formValidation,
        periodRadioItems,
        transList
    };
}
