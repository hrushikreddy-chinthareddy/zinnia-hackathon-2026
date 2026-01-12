import { TFunction } from 'next-i18next';

import { BankingFields } from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers';
import { SignatureFieldNames } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    FormParts,
    FormParty,
    FormValidationErrors,
    PartyRoles,
    PaymentMethod,
    QualTypes,
} from '@deps/models/case/withdrawal/case';

export const getQualTypeOptions = (t: TFunction) => [
    {
        label: t('oftProcess.qualTypes.nonQualified'),
        value: QualTypes.NonQualified,
    },
    {
        label: t('oftProcess.qualTypes.convertedRothIRA'),
        value: QualTypes.ConvertedRothIRA,
    },
    {
        label: t('oftProcess.qualTypes.custInhIRA'),
        value: QualTypes.CustInhIRA,
    },
    {
        label: t('oftProcess.qualTypes.custInhRothIRA'),
        value: QualTypes.CustInhRothIRA,
    },
    {
        label: t('oftProcess.qualTypes.custRolloverIRA'),
        value: QualTypes.CustRolloverIRA,
    },
    {
        label: t('oftProcess.qualTypes.custSARSEPIRA'),
        value: QualTypes.CustSARSEPIRA,
    },
    {
        label: t('oftProcess.qualTypes.custSimpleIRA'),
        value: QualTypes.CustSimpleIRA,
    },
    {
        label: t('oftProcess.qualTypes.custSpousalIRA'),
        value: QualTypes.CustSpousalIRA,
    },
    {
        label: t('oftProcess.qualTypes.custodialIRA'),
        value: QualTypes.CustodialIRA,
    },
    {
        label: t('oftProcess.qualTypes.custodialIRASEP'),
        value: QualTypes.CustodialIRASEP,
    },
    {
        label: t('oftProcess.qualTypes.custodialQLACIRA'),
        value: QualTypes.CustodialQLACIRA,
    },
    {
        label: t('oftProcess.qualTypes.custodialRothIRA'),
        value: QualTypes.CustodialRothIRA,
    },
    {
        label: t('oftProcess.qualTypes.inheritedIRA'),
        value: QualTypes.InheritedIRA,
    },
    {
        label: t('oftProcess.qualTypes.inheritedRothIRA'),
        value: QualTypes.InheritedRothIRA,
    },
    {
        label: t('oftProcess.qualTypes.iRARegular'),
        value: QualTypes.IRARegular,
    },
    {
        label: t('oftProcess.qualTypes.iRARollover'),
        value: QualTypes.IRARollover,
    },
    { label: t('oftProcess.qualTypes.iRASEP'), value: QualTypes.IRASEP },
    { label: t('oftProcess.qualTypes.iRASimple'), value: QualTypes.IRASimple },
    {
        label: t('oftProcess.qualTypes.iRASpousal'),
        value: QualTypes.IRASpousal,
    },
    { label: t('oftProcess.qualTypes.qLACIRA'), value: QualTypes.QLACIRA },
    { label: t('oftProcess.qualTypes.rothIRA'), value: QualTypes.RothIRA },
    { label: t('oftProcess.qualTypes.a401'), value: QualTypes.a401 },
    {
        label: t('oftProcess.qualTypes.aSchedA401'),
        value: QualTypes.aSchedA401,
    },
    { label: t('oftProcess.qualTypes.g401'), value: QualTypes.g401 },
    { label: t('oftProcess.qualTypes.k401'), value: QualTypes.k401 },
    { label: t('oftProcess.qualTypes.b403'), value: QualTypes.b403 },
    { label: t('oftProcess.qualTypes.e3412'), value: QualTypes.e3412 },
    {
        label: t('oftProcess.qualTypes.deferredComp457'),
        value: QualTypes.DeferredComp457,
    },
    {
        label: t('oftProcess.qualTypes.corporatePension'),
        value: QualTypes.CorporatePension,
    },
    { label: t('oftProcess.qualTypes.groupTSA'), value: QualTypes.GroupTSA },
    { label: t('oftProcess.qualTypes.kEOGHHR10'), value: QualTypes.KEOGHHR10 },
    {
        label: t('oftProcess.qualTypes.moneyPurchasePensionPlan'),
        value: QualTypes.MoneyPurchasePensionPlan,
    },
    {
        label: t('oftProcess.qualTypes.pensionPlan'),
        value: QualTypes.PensionPlan,
    },
    {
        label: t('oftProcess.qualTypes.profitSharingPlan'),
        value: QualTypes.ProfitSharingPlan,
    },
    {
        label: t('oftProcess.qualTypes.targetBenefitPlan'),
        value: QualTypes.TargetBenefitPlan,
    },
    {
        label: t('oftProcess.qualTypes.brokerageAccountNon1035Exchange'),
        value: QualTypes.BrokerageAccountNon1035Exchange,
    },
    {
        label: t('oftProcess.qualTypes.serviceCredits'),
        value: QualTypes.ServiceCredits,
    },
];

export const commonOftFormValidation = (
    t: TFunction,
    { formSignature, formDisbursement }: Partial<FormParts> = {}
): FormValidationErrors => {
    const errors = {} as FormValidationErrors;

    if (
        [PaymentMethod.EFT, PaymentMethod.Wire].includes(
            formDisbursement?.paymentMethod?.text as PaymentMethod
        )
    ) {
        if (
            formDisbursement?.bank[0].bankName === '' &&
            formDisbursement?.bank[0].accountNumber !==
                formDisbursement?.bank[0].reEnterAccountNumber
        ) {
            errors[BankingFields.ReEnterAccountNumber] = t(
                'formValidation.accountNumberDoesNotMatch'
            );
        }
        if (
            formDisbursement?.bank[0].bankName === '' &&
            formDisbursement?.bank[0].routingNumber !==
                formDisbursement?.bank[0].reEnterBankRoutingNumber
        ) {
            errors[BankingFields.ReEnterBankRoutingNumber] = t(
                'formValidation.routingNumberDoesNotMatch'
            );
        }
    }

    if (
        formDisbursement?.bank[0].accountType?.text === '' &&
        [PaymentMethod.EFT, PaymentMethod.Wire].includes(
            formDisbursement?.paymentMethod?.text as PaymentMethod
        )
    ) {
        errors[BankingFields.AccountType] = t(
            'formValidation.accountTypeMustBeSelected'
        );
    }

    const ownerSignature = formSignature?.signatures?.find(
        (sigInfo) =>
            sigInfo?.signType?.text === SignatureValidationTypeWithdrawal.Owner
    );

    // No choice made for signature
    if (ownerSignature?.isSigned !== false && !ownerSignature?.isSigned) {
        errors[
            `${SignatureValidationTypeWithdrawal.Owner}${SignatureFieldNames.SignaturePresent}`
        ] = t('formValidation.signaturePresentOptionMustBeSelected');
    }

    return errors;
};

export enum MorganStanleyFirm {
    FULLNAME = 'MSSB',
    TAX_ID = '510116113',
}

export enum WellsFargoFirm {
    FULLNAME = 'WELLS FARGO',
    TAX_ID = '232384840',
}

interface FirmIdentifier {
    fullName: string;
    taxId: string;
}

const getOwnerInfo = (formParty: FormParty) =>
    formParty?.parties?.find(
        (party) => party.partyRoleType === PartyRoles.OWNER
    );

const isFirm = (formParty: FormParty, firm: FirmIdentifier): boolean => {
    const ownerInfo = getOwnerInfo(formParty);
    if (!ownerInfo) return false;
    const ownerFullName = ownerInfo.fullName?.toUpperCase();
    return (
        ownerFullName?.includes(firm.fullName) || ownerInfo.taxId === firm.taxId
    );
};

export const isMorganStanleyFirm = (formParty: FormParty): boolean =>
    isFirm(formParty, {
        fullName: MorganStanleyFirm.FULLNAME,
        taxId: MorganStanleyFirm.TAX_ID,
    });

export const isWellsFargoFirm = (formParty: FormParty): boolean =>
    isFirm(formParty, {
        fullName: WellsFargoFirm.FULLNAME,
        taxId: WellsFargoFirm.TAX_ID,
    });
