export type ProposedAnnuityQuoteProps = {
    annuityQuote: AnnuityQuote;
    onAnnuityQuoteChange: React.Dispatch<React.SetStateAction<any>>;
    formConfig: ProposedAnnuityQuoteConfig;
    product?: string;
    contractId?: number;
};

type ProposedAnnuityQuoteConfig = {
    fields: {
        annuitizationQuote?: {
            title: string;
        };
        proposedAnnuityQuote?: {
            title: string;
        };
        annuityPaymentAmount: {
            fieldName: string;
            fieldLabel: string;
            isRequired: boolean;
        };
        firstPaymentDate: {
            fieldName: string;
            fieldLabel: string;
            isRequired: boolean;
        };
        paymentFrequency?: {
            fieldName: string;
            fieldLabel: string;
            isRequired: boolean;
        };
        incomeOption?: {
            fieldName: string;
            fieldLabel: string;
            isRequired: boolean;
        };
        periodCertainYears?: {
            fieldName: string;
            fieldLabel: string;
            isRequired: boolean;
        };

        paymentFrequencyText?: {
            fieldName: string;
            fieldLabel: string;
            isRequired: boolean;
        };
        incomeOptionText?: {
            fieldName: string;
            fieldLabel: string;
            isRequired: boolean;
        };
        typeOfPayment?: {
            fieldLabel: string;
            selectOptions: { label: string; value: string }[];
            isRequired: boolean;
        };
    };
};

export type AnnuityQuote = {
    annuityPaymentAmount: number;
    firstPaymentDate: string;
    paymentFrequency: string;
    incomeOption: string;
    periodCertainYears?: string;
    typeOfPayment?: string;
};

export enum ProposedAnnuityFormData {
    AnnuityPaymentAmount = 'annuityPaymentAmount',
    FirstPaymentDate = 'firstPaymentDate',
    PaymentFrequency = 'paymentFrequency',
    IncomeOption = 'incomeOption',
    TypeOfPayment = 'typeOfPayment',
    PeriodCertainYears = 'periodCertainYears',
}
