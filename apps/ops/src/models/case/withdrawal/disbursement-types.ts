import { Dispatch, SetStateAction } from 'react';

import { DEFAULT_ADDRESS } from '@deps/components/otp-withdrawal-form/address-entry';
import { BankDetailsInputMethod } from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement-parts/autofill-account-toggle';
import { BankingFields } from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helper';
import { SignatureValidationField } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation';
import { RadioItem } from '@deps/components/radio/radio';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import {
    AccountType,
    Address,
    BankDetails,
    FormDisbursement,
    FormDisbursement as FormDisbursementType,
    PaymentMailType,
    PaymentMethod,
} from '@deps/models/case/withdrawal/case';

type FieldData = {
    options?: { label: string; value: string }[];
};

// Selection options for payment method
export const FormDisbursementSelections = { ...PaymentMethod, ...PaymentMailType, SimpleBrokerage: 'SimpleBrokerage' };
export type FormDisbursementSelections = typeof FormDisbursementSelections;

export enum DisbursementToggleType {
    MaskedInfoToggle = 'MaskedInfoToggle',
    AutoFillInfoToggle = 'AutoFillInfoToggle',
}

export enum SupportedValidationOperation {
    Equal = 'equal',
}

export type BankFieldConfig = {
    fieldName: BankingFields;
    fieldLabel: string;
    classNames?: string;
    data?: FieldData;
    tooltip?: Tooltip;
    maxLength?: number;
    isBankingField?: boolean;
    maskOnBlur?: boolean;
    validator?: (operation: SupportedValidationOperation, currentValue: string, allValues: DisbursementParts) => string;
    error?: string;
    disableCopyPaste?: boolean;
};

export type Tooltip = {
    shouldDisplay: boolean;
    title?: string;
    body?: string;
};

export type PaymentMethodAdditionalOptions = {
    disbursementToggleType?: DisbursementToggleType;
    toggleOptions?: Array<{ label: string; value: string }>;
    defaultPrefillMethod?: BankDetailsInputMethod;
    prefillBankData?: DisbursementParts;
};

export interface PaymentMethodOption extends Omit<RadioItem, 'subelement'> {
    fields: DisbursementConfig[] | null;
    additionalOptions?: PaymentMethodAdditionalOptions;
    disabled?: boolean;
    consentAvailableConfig?: SignatureValidationField[];
    getDefaultPayload: (val: FormDisbursement) => DisbursementParts;
    generatePayloadFromSelection: (val: DisbursementParts) => FormDisbursementType;
}

export type DisbursementInformation = BankFieldConfig & { isFormStateReadOnly: boolean } & {
    disbursementInformation: DisbursementParts;
    onDataChange: Dispatch<SetStateAction<DisbursementParts>>;
};

export type DisbursementConfig = {
    component: React.FC<DisbursementInformation>;
    shouldDisplay?: (val: OtpWithdrawalFormState) => boolean;
} & BankFieldConfig;

// Payment mail types that map to paymentMailType in the API
export const API_PAYMENT_MAIL_TYPE_ENUMS = [PaymentMailType.Check, PaymentMailType.ExpressCheck];

// Payment methods that require banking information
export const BANKING_INFORMATION_ENUMS = [
    PaymentMethod.Direct,
    PaymentMethod.EFT,
    PaymentMethod.ListBill,
    PaymentMethod.ListBillForward,
    PaymentMethod.Wire,
];

export const accountTypeOptions = [
    {
        label: `savings`,
        value: AccountType.Savings,
    },
    {
        label: `checking`,
        value: AccountType.Checking,
    },
];

export const DEFAULT_DISBURSEMENT_UPDATE: DisbursementParts = {
    accountNumber: '',
    reEnterAccountNumber: '',
    accountType: AccountType.Checking,
    bankContactPerson: '',
    bankFurtherCreditAccount: '',
    bankFurtherCreditName: '',
    bankLocation: '',
    bankName: '',
    bankRoutingNumber: '',
    reEnterBankRoutingNumber: '',
    bankPhone: '',
    nameOnBankAccount: '',
    isVoidCheckAttached: null,
    doesCheckMeetSecurityRequirements: null,
    isWireApprovalPresent: null,
    address: DEFAULT_ADDRESS,
    acordAttached: null,
    companyName: '',
    participantId: '',
    payeeName: '',
    contractNumber: '',
    taxId: '',
    zip: '',
    emailDeliveryNotification: false,
    isDifferentPayeeOrAddress: false,
    maskedAccountNumber: '',
    accountHolder: '',
    accountName: '',
    emailNotification: null,
    selectIfPayeeIsDifferent: false,
    isDirectDepositValid: null,
    isDirectDeposit: true,
    fboDetails: '',
    consentAvailable: null,
    firstTimeExpressCheck: null,
};

export const DEFAULT_BANK_DETAILS: BankDetails = {
    accountNumber: '',
    accountType: {
        text: '',
    },
    bankContactPerson: '',
    bankFurtherCreditAccount: '',
    bankFurtherCreditName: '',
    bankInfoCompleteInd: '',
    bankLocation: '',
    bankName: '',
    bankPhone: '',
    nameOnBankAccount: '',
    routingNumber: '',
    maskedAccountNumber: null,
    isDirectDeposit: {
        text: true,
    },
    isDirectDepositValid: {
        text: null,
    },
};
export interface DisbursementParts {
    accountNumber: string;
    reEnterAccountNumber?: string;
    accountType: AccountType | '';
    bankContactPerson: string;
    bankFurtherCreditAccount: string;
    bankFurtherCreditName: string;
    bankRoutingNumber: string;
    reEnterBankRoutingNumber?: string;
    bankLocation: string;
    bankName: string;
    bankPhone: string;
    nameOnBankAccount: string;
    isVoidCheckAttached: boolean | null;
    firstTimeExpressCheck: boolean | null;
    isWireApprovalPresent: boolean | null;
    doesCheckMeetSecurityRequirements: boolean | null;
    address: Address;
    acordAttached: boolean | null;
    companyName: string;
    participantId: string | null;
    payeeName: string | null;
    contractNumber: string | null;
    taxId: string | null;
    zip: string;
    emailDeliveryNotification: boolean;
    isDifferentPayeeOrAddress: boolean;
    maskedAccountNumber: string | null;
    accountHolder: string | null;
    accountName: string | null;
    emailNotification: boolean | null;
    selectIfPayeeIsDifferent: boolean;
    isDirectDepositValid: boolean | null;
    bank?: BankDetails;
    bankType?: string;
    isDirectDeposit?: boolean;
    fboDetails: string;
    consentAvailable: boolean | null;
}
