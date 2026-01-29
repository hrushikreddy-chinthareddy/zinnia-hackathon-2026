import {
    FormDisbursement,
    PaymentMethod,
} from '@deps/models/case/withdrawal/case';
import {
    DisbursementParts as DisbursementPartsModel,
    SupportedValidationOperation,
} from '@deps/models/case/withdrawal/disbursement-types';

export interface BankInFile {
    BankId: number;
    BankName: string;
    RoutingNumber: string;
    AccountNumber: string;
    AccountType: 'Checking' | 'Savings';
    Purpose: string;
    PaymentMethod: PaymentMethod | '';
    BankStartDate: string;
    BankEndDate: string;
    ListBillId: number;
    EFTCode: string;
    EFTStatus: 'Active' | 'Inactive';
}

export interface BankingDetails {
    isBankSelected: boolean;
    bankingInFile: BankInFile[] | null | [];
    selectedBanking: SelectedBanking | '';
    paymentMethod: PaymentMethod | '';
}

export enum SelectedBanking {
    OnFile = 'onFile',
    New = 'new',
}

/** Generic wrapper for fields shaped like { text: ... } */
export interface TextField<T = string | null> {
    text: T | null;
}

export interface BankEntry {
    accountNumber: string;
    accountType?: string | null;
    bankContactPerson?: string | null;
    bankFurtherCreditAccount?: string | null;
    bankFurtherCreditName?: string | null;
    bankInfoCompleteInd?: string | null;
    bankLocation?: string | null;
    bankName?: string | null;
    bankPhone?: string | null;
    nameOnBankAccount?: string | null;
    routingNumber?: string | null;
    maskedAccountNumber?: string | null;
    isDirectDeposit?: TextField<boolean> | null;
    isDirectDepositValid?: TextField<boolean | null> | null;
    reEnterAccountNumber?: string | null;
    reEnterBankRoutingNumber?: string | null;
}

export type BankValidationDetail = Record<string, string | null>;

export interface BankVerification {
    selectedBankingType?: string | null;
    validationsMap?: Record<string, BankValidationDetail> | null;
}

export interface IFormDisbursement {
    paymentMethod?: TextField<string> | null;
    paymentMailType?: TextField<string | null> | null;
    bank?: BankEntry[] | null;
    payeeType?: string | null;
    doesCheckMeetSecRequiremnt?: boolean | null;
    paymentToBrokerageAccount?: boolean;
    brokerage?: any | null;
    participantId?: TextField<string | null> | null;
    payee?: any | null;
    emailDeliveryNotification?: TextField<boolean> | null;
    upsAccount?: any | null;
    isDifferentPayeeOrAddress?: TextField<boolean> | null;
    disbursmentConsent?: any | null;
    firstTimeExpressCheck?: TextField<boolean> | null;
    isWireApprovalPresent?: any | null;
    voidCheck?: any | null;
    isPayeeFinancialIns?: boolean;
    isAnnuitant?: boolean;
    bankVerification?: BankVerification | null;
}

/**
 * Represents the parts of a disbursement that can be used in payload generation
 */
export interface DisbursementParts {
    payeeName?: string;
    address?: any;
    fboDetails?: string;
    bank?: any[];
    bankVerification?: any;
    [key: string]: any;
}

/**
 * Validator function type for field validation
 */
export type ValidatorFunction = (
    operation: SupportedValidationOperation,
    currentValue: string,
    allValues: DisbursementPartsModel
) => string;

/**
 * Represents a field configuration in a disbursement option
 */
export interface DisbursementFieldConfig {
    fieldName: string;
    fieldLabel?: string;
    fieldType: string;
    classNames?: string;
    isBankingField?: boolean;
    maskOnBlur?: boolean;
    disableCopyPaste?: boolean;
    maxLength?: number;
    isAddressLine2Required?: boolean;
    validator?: ValidatorFunction;
}

/**
 * Represents a single disbursement option configuration
 */
export interface DisbursementOption {
    label: string;
    value: string;
    fields: DisbursementFieldConfig[] | null;
    getDefaultPayload?: (formDisbursement: FormDisbursement) => any;
    generatePayloadFromSelection: (
        defaultDisbursementInfo: any,
        bankingInFile?: BankingDetails[] | null | []
    ) => any;
    consentAvailableConfig?: any;
}

/**
 * Type for the array of disbursement options
 */
export type DisbursementOptions = DisbursementOption[];
