import { useTranslation } from 'next-i18next';

import { BankingFields } from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helper';
import { createValidator } from '@deps/containers/otp/utils/helper-utils';

export const BankFieldConfigs: any = () => {
    const { t } = useTranslation(undefined);
    return {
        isVoidCheckField: {
            fieldName: BankingFields.IsVoidCheckAttached,
            fieldLabel: t('distributionMethod.isVoidCheckAttached'),
            // component: DisbursementFields.BankBooleanButtonGroup,
            classNames: 'col-start-1',
        },
        meetSecurityCheck: {
            fieldName: BankingFields.DoesCheckMeetSecurityRequirements,
            fieldLabel: t('distributionMethod.doesCheckMeetSecurityRequirement'),
        },
        accountType: {
            fieldName: BankingFields.AccountType,
            fieldLabel: t('distributionMethod.accountType'),
            classNames: 'col-start-1 col-span-2 w-full',
            isBankingField: true,
        },
        accountNumber: {
            fieldName: BankingFields.AccountNumber,
            fieldLabel: t('distributionMethod.accountNumber'),
            // component: DisbursementFields.BankTextField,
            classNames: 'col-start-1',
            isBankingField: true,
            maskOnBlur: true,
            disableCopyPaste: true,
        },
        reEnterAccountNumber: {
            fieldName: BankingFields.ReEnterAccountNumber,
            fieldLabel: t('distributionMethod.reEnterAccountNumber'),
            // component: DisbursementFields.BankTextField,
            classNames: 'col-start-2',
            isBankingField: true,
            disableCopyPaste: true,
            validator: createValidator('accountNumber', t('formValidation.accountNumberDoesNotMatch')),
        },
        bankRoutingNumber: {
            fieldName: BankingFields.BankRoutingNumber,
            fieldLabel: t('distributionMethod.bankRoutingNumber'),
            // component: DisbursementFields.BankTextField,
            isBankingField: true,
            classNames: 'col-start-1',
            maskOnBlur: true,
            disableCopyPaste: true,
        },
        reEnterBankRoutingNumber: {
            fieldName: BankingFields.ReEnterBankRoutingNumber,
            fieldLabel: t('distributionMethod.reEnterBankRoutingNumber'),
            // component: DisbursementFields.BankTextField,
            isBankingField: true,
            disableCopyPaste: true,
            validator: createValidator('bankRoutingNumber', t('formValidation.routingNumberDoesNotMatch')),
        },
        bankName: {
            fieldName: BankingFields.BankName,
            fieldLabel: t('distributionMethod.bankName'),
            // component: DisbursementFields.BankTextField,
            isBankingField: true,
            classNames: 'col-start-1',
        },
        accountHolder: {
            fieldName: BankingFields.AccountHolder,
            fieldLabel: t('distributionMethod.accountHolder'),
            // component: DisbursementFields.BankTextField,
            classNames: 'col-start-2',
        },
        // fields: [
        //     {
        //         fieldName: BankingFields.AccountNumber,
        //         fieldLabel: t('distributionMethod.accountNumber'),
        //         component: DisbursementFields.BankTextField,
        //         classNames: 'col-start-1',
        //         isBankingField: true,
        //         maskOnBlur: true,
        //         disableCopyPaste: true,
        //     },
        //     {
        //         fieldName: BankingFields.ReEnterAccountNumber,
        //         fieldLabel: t('distributionMethod.reEnterAccountNumber'),
        //         component: DisbursementFields.BankTextField,
        //         classNames: 'col-start-2',
        //         isBankingField: true,
        //         disableCopyPaste: true,
        //         validator: createValidator('accountNumber', t('formValidation.accountNumberDoesNotMatch')),
        //     },
        //     {
        //         fieldName: BankingFields.BankRoutingNumber,
        //         fieldLabel: t('distributionMethod.bankRoutingNumber'),
        //         component: DisbursementFields.BankTextField,
        //         isBankingField: true,
        //         classNames: 'col-start-1',
        //         maskOnBlur: true,
        //         disableCopyPaste: true,
        //     },
        //     {
        //         fieldName: BankingFields.ReEnterBankRoutingNumber,
        //         fieldLabel: t('distributionMethod.reEnterBankRoutingNumber'),
        //         component: DisbursementFields.BankTextField,
        //         isBankingField: true,
        //         disableCopyPaste: true,
        //         validator: createValidator('bankRoutingNumber', t('formValidation.routingNumberDoesNotMatch')),
        //     },
        //     {
        //         fieldName: BankingFields.BankName,
        //         fieldLabel: t('distributionMethod.bankName'),
        //         component: DisbursementFields.BankTextField,
        //         isBankingField: true,
        //         classNames: 'col-start-1',
        //     },
        //     {
        //         fieldName: BankingFields.AccountHolder,
        //         fieldLabel: t('distributionMethod.accountHolder'),
        //         component: DisbursementFields.BankTextField,
        //         classNames: 'col-start-2',
        //     },
        // ],
    };
};
