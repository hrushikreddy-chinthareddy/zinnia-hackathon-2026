import dayjs from 'dayjs';
import { TFunction } from 'i18next';

import { OtpReg60FormState } from '@deps/contexts/Reg60FormContext';
import { DocumentData } from '@deps/models/case/document';
import { CreateTaskBody } from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import { PartyRoles } from '@deps/models/case/withdrawal/case';

import { Disclosure } from '../components/create-disclosure/create-disclosure.types';
import { Reg60FormData } from '../reg60.types';

const getUpdateDisclosure = (disclosureData: Disclosure) => {
    const contractComparisonsCl = disclosureData.contractComparison;
    contractComparisonsCl?.map(item => {
        if (!item.annuitizationValueReceived) {
            item.annuitizationQuote = null;
        }
    });
    return {
        ...disclosureData,
        contractComparison: contractComparisonsCl,
    };
};

export const buildForm = (
    status: TaskStatus,
    document: DocumentData,
    formState: OtpReg60FormState
): CreateTaskBody<TaskStatus, Reg60FormData> => {
    const { initialForm } = formState;
    const reg60BuildDisclosure = getUpdateDisclosure(formState.disclosure);

    const payload = {
        source: 'Zinnia.SupportTool',
        taskType: 'NBReg60Comparision',
        status,
        data: {
            documentNumber: document?.documentNumber,
            source: 'SupportTool',
            contractNum: document?.contract,
            userId: initialForm.data.userId,
            onbaseCaseId: document?.caseId,
            taskType: 'NBReg60Comparision',
            clientCode: initialForm.data.clientCode,
            lob: document?.lob,
            documentReceivedDate: dayjs(document.dateReceived, 'M/D/YYYY hh:mm:ss A').format('YYYY-MM-DDTHH:mm:ss:Z'),
            requestedDate: dayjs().format('YYYY-MM-DDTHH:mm:ss:Z'),
            ownerInformation: formState.ownerInformation,
            agentInformation: formState.agentInformation,
            disclosureAuthorization: formState.disclosureAuthorization,
            disclosure: reg60BuildDisclosure,
        },
    };

    return payload;
};

export const createOwnerInfo = {
    personalInformation: {
        firstName: '',
        middleName: '',
        lastName: '',
        phoneNumber: '',
        ssNumber: '',
        phoneExtension: '',
        phoneType: {
            home: false,
            work: false,
            mobile: false,
        },
    },
    addressDetails: {
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        state: '',
        zipCode: '',
    },
};

export const createAgentInfo = {
    personalInformation: {
        firstName: '',
        middleName: '',
        lastName: '',
        phoneNumber: '',
        ssNumber: '',
        phoneExtension: '',
        phoneType: {
            home: false,
            work: false,
            mobile: false,
        },
    },
    companyName: '',
    channel: '',
    addressDetails: {
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        state: '',
        zipCode: '',
    },
};

export const getCreateDisclosureInfo = () => [
    {
        comparisonId: 1,
        comparisonType: 'VARIABLE_TO_FIXED',
        partialRequest: false,
        goodFaithEstimateRequired: false,
        companyName: '',
        companyPhoneNumber: '',
        contractNumber: '',
        issueDate: '',
        accountValue: '',
        surrenderCharge: {
            applicable: false,
        },
        mvaAmount: {
            applicable: false,
        },
        surrenderValue: '',
        annuitizationValueReceived: false,
        annuitizationQuote: null,
        carrierBenefits: {
            surrenderBenefit: [
                {
                    period: '5YEAR',
                    returnGuarRate: '',
                    returnCurrRate: '',
                    return0Prct: '',
                    return6Prct: '',
                    return12Prct: '',
                },
                {
                    period: '10YEAR',
                    returnGuarRate: '',
                    returnCurrRate: '',
                    return0Prct: '',
                    return6Prct: '',
                    return12Prct: '',
                },
            ],
            deathBenefit: [
                {
                    period: '5YEAR',
                    returnGuarRate: '',
                    returnCurrRate: '',
                    return0Prct: '',
                    return6Prct: '',
                    return12Prct: '',
                },
                {
                    period: '10YEAR',
                    returnGuarRate: '',
                    returnCurrRate: '',
                    return0Prct: '',
                    return6Prct: '',
                    return12Prct: '',
                },
            ],
        },
    },
];

export const createDisclosureAuthorization = {
    signatureDate: '',
    expectedAcctValue: 0,
    product: '',
    cdscPeriod: '',
};

export function getErrorObjectByRole(role: PartyRoles, errors: any) {
    const roleObject = {} as any;

    // Loop through each error key
    for (const errorKey in errors) {
        // Split the key to get the role and field name
        const [rolePart, field] = errorKey.split('_');

        // Check if the role matches the provided role
        if (rolePart.toLowerCase() === role.toLowerCase()) {
            // If it matches, create the field within the role object
            roleObject[field] = errors[errorKey];
        }
    }

    return { [role]: roleObject }; // Wrap the role object with the role as key
}

export const generateYearOptions = () => {
    const options = [];
    for (let i = 5; i <= 50; i += 5) {
        options.push({ value: i.toString(), label: i.toString() });
    }

    return options;
};

export enum AnnuityPaymentType {
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    SEMI_ANNUALLY = 'SEMI_ANNUALLY',
    ANNUALLY = 'ANNUALLY',
}

export const getPaymentFrequencyOptions = (t: TFunction) => [
    { label: t('proposedAnnuityQuote.paymentFrequency.monthly'), value: AnnuityPaymentType.MONTHLY },
    { label: t('proposedAnnuityQuote.paymentFrequency.quarterly'), value: AnnuityPaymentType.QUARTERLY },
    { label: t('proposedAnnuityQuote.paymentFrequency.semiAnnually'), value: AnnuityPaymentType.SEMI_ANNUALLY },
    { label: t('proposedAnnuityQuote.paymentFrequency.annually'), value: AnnuityPaymentType.ANNUALLY },
];

export enum RetireEaseOptions {
    SINGLE_LIFE_CASH_REFUND = 'SINGLE_LIFE_CASH_REFUND',
    SINGLE_LIFE_INSTALL_REF = 'SINGLE_LIFE_INSTALL_REF',
    SINGLE_LIFE_PC = 'SINGLE_LIFE_PC',
    SINGLE_LIFE_NO_REFUND = 'SINGLE_LIFE_NO_REFUND',
    JT_SURV_LIFE_CASH_REF = 'JT_SURV_LIFE_CASH_REF',
    JT_SURV_INSTALL_REF = 'JT_SURV_INSTALL_REF',
    JT_SURV_LIFE_PC = 'JT_SURV_LIFE_PC',
    JT_SURV_LIFE_1_2_REDUCT = 'JT_SURV_LIFE_1_2_REDUCT',
    JT_SURV_LIFE_2_3_REDUCT = 'JT_SURV_LIFE_2_3_REDUCT',
    JT_SURV_LIFE_3_4_REDUCT = 'JT_SURV_LIFE_3_4_REDUCT',
    JT_SURV_LIFE_NO_REFUND = 'JT_SURV_LIFE_NO_REFUND',
    PERIOD_CERTAIN = 'PERIOD_CERTAIN',
}

export enum RetireEaseChoiceOptions {
    SINGLE_LIFE_NO_DEATH_BFT = 'SINGLE_LIFE_NO_DEATH_BFT',
    SINGLE_LIFE_CASH_REFUND = 'SINGLE_LIFE_CASH_REFUND',
    SINGLE_LIFE_INSTALL_REF = 'SINGLE_LIFE_INSTALL_REF',
    SINGLE_LIFE_NO_REFUND = 'SINGLE_LIFE_NO_REFUND',
    SINGLE_LIFE_PC = 'SINGLE_LIFE_PC',
    JT_SURV_LIFE_NO_REFUND = 'JT_SURV_LIFE_NO_REFUND',
    JT_SURV_LIFE_PC = 'JT_SURV_LIFE_PC',
    JT_SURV_LIFE_CASH_REF = 'JT_SURV_LIFE_CASH_REF',
    JT_SURV_INSTALL_REF = 'JT_SURV_INSTALL_REF',
    JT_SURV_LIFE_1_2_REDUCT = 'JT_SURV_LIFE_1_2_REDUCT',
    JT_SURV_LIFE_2_3_REDUCT = 'JT_SURV_LIFE_2_3_REDUCT',
    JT_SURV_LIFE_3_4_REDUCT = 'JT_SURV_LIFE_3_4_REDUCT',
    JT_SURV_CONV_NO_REF = 'JT_SURV_CONV_NO_REF',
    JT_SURV_CONV_PC = 'JT_SURV_CONV_PC',
    JT_SURV_CONV_CASH_REF = 'JT_SURV_CONV_CASH_REF',
    JT_SURV_CONV_INSTALL_REF = 'JT_SURV_CONV_INSTALL_REF',
    JT_SURV_LIFE_NO_BFT = 'JT_SURV_LIFE_NO_BFT',
}

export const getRetireEaseOptions = (t: TFunction) => [
    { label: t('proposedAnnuityQuote.incomeOption.singleLifeCashRefund'), value: RetireEaseOptions.SINGLE_LIFE_CASH_REFUND },
    { label: t('proposedAnnuityQuote.incomeOption.singleLifeInstallRef'), value: RetireEaseOptions.SINGLE_LIFE_INSTALL_REF },
    { label: t('proposedAnnuityQuote.incomeOption.singleLifePC'), value: RetireEaseOptions.SINGLE_LIFE_PC },
    { label: t('proposedAnnuityQuote.incomeOption.singleLifeNoRefund'), value: RetireEaseOptions.SINGLE_LIFE_NO_REFUND },
    { label: t('proposedAnnuityQuote.incomeOption.jtAndSurvLifeCashRef'), value: RetireEaseOptions.JT_SURV_LIFE_CASH_REF },
    { label: t('proposedAnnuityQuote.incomeOption.jtAndSurvInstallRef'), value: RetireEaseChoiceOptions.JT_SURV_INSTALL_REF },
    { label: t('proposedAnnuityQuote.incomeOption.jtAndSurvLifePC'), value: RetireEaseOptions.JT_SURV_LIFE_PC },
    { label: t('proposedAnnuityQuote.incomeOption.jtAndSurvLifeHalfReduct'), value: RetireEaseOptions.JT_SURV_LIFE_1_2_REDUCT },
    { label: t('proposedAnnuityQuote.incomeOption.jtAndSurvLifeTwoThirdsReduct'), value: RetireEaseOptions.JT_SURV_LIFE_2_3_REDUCT },
    { label: t('proposedAnnuityQuote.incomeOption.jtAndSurvLifeThreeFourthsReduct'), value: RetireEaseOptions.JT_SURV_LIFE_3_4_REDUCT },
    { label: t('proposedAnnuityQuote.incomeOption.jtAndSurvLifeNoRefund'), value: RetireEaseOptions.JT_SURV_LIFE_NO_REFUND },
    { label: t('proposedAnnuityQuote.incomeOption.periodCertain'), value: RetireEaseOptions.PERIOD_CERTAIN },
];

export const getRetireEaseChoiceOptions = (t: TFunction) => [
    { label: t('proposedAnnuityQuote.incomeOption.singleLifeNoDeathBft'), value: RetireEaseChoiceOptions.SINGLE_LIFE_NO_DEATH_BFT },
    { label: t('proposedAnnuityQuote.incomeOption.singleLifeCashRefund'), value: RetireEaseChoiceOptions.SINGLE_LIFE_CASH_REFUND },
    { label: t('proposedAnnuityQuote.incomeOption.singleLifeInstallRef'), value: RetireEaseChoiceOptions.SINGLE_LIFE_INSTALL_REF },
    { label: t('proposedAnnuityQuote.incomeOption.singleLifeNoRefund'), value: RetireEaseChoiceOptions.SINGLE_LIFE_NO_REFUND },
    { label: t('proposedAnnuityQuote.incomeOption.singleLifePC'), value: RetireEaseChoiceOptions.SINGLE_LIFE_PC },
    { label: t('proposedAnnuityQuote.incomeOption.jtAndSurvLifeNoRefund'), value: RetireEaseChoiceOptions.JT_SURV_LIFE_NO_REFUND },
    { label: t('proposedAnnuityQuote.incomeOption.jtAndSurvLifePC'), value: RetireEaseChoiceOptions.JT_SURV_LIFE_PC },
    { label: t('proposedAnnuityQuote.incomeOption.jtAndSurvLifeCashRef'), value: RetireEaseChoiceOptions.JT_SURV_LIFE_CASH_REF },
    { label: t('proposedAnnuityQuote.incomeOption.jtAndSurvInstallRef'), value: RetireEaseChoiceOptions.JT_SURV_INSTALL_REF },
    { label: t('proposedAnnuityQuote.incomeOption.jtAndSurvLifeHalfReduct'), value: RetireEaseChoiceOptions.JT_SURV_LIFE_1_2_REDUCT },
    { label: t('proposedAnnuityQuote.incomeOption.jtAndSurvLifeTwoThirdsReduct'), value: RetireEaseChoiceOptions.JT_SURV_LIFE_2_3_REDUCT },
    {
        label: t('proposedAnnuityQuote.incomeOption.jtAndSurvLifeThreeFourthsReduct'),
        value: RetireEaseChoiceOptions.JT_SURV_LIFE_3_4_REDUCT,
    },
    { label: t('proposedAnnuityQuote.incomeOption.jtAndSurvConvNoRef'), value: RetireEaseChoiceOptions.JT_SURV_CONV_NO_REF },
    { label: t('proposedAnnuityQuote.incomeOption.jtAndSurvConvPC'), value: RetireEaseChoiceOptions.JT_SURV_CONV_PC },
    { label: t('proposedAnnuityQuote.incomeOption.jtAndSurvConvCashRef'), value: RetireEaseChoiceOptions.JT_SURV_CONV_CASH_REF },
    { label: t('proposedAnnuityQuote.incomeOption.jtAndSurvConvInstallRef'), value: RetireEaseChoiceOptions.JT_SURV_CONV_INSTALL_REF },
];
