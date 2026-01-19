import { BankingDetails } from '@deps/components/otp-withdrawal-form/form-disbursement-V2/form-disbursement.types';
import {
    Address,
    BankDetails,
    FormDisbursement,
} from '@deps/models/case/withdrawal/case';
import {
    DisbursementParts,
    SupportedValidationOperation,
} from '@deps/models/case/withdrawal/disbursement-types';

/**
 * Validator function type for field validation
 */
export type ValidatorFunction = (
    operation: SupportedValidationOperation,
    currentValue: string,
    allValues: DisbursementParts
) => string;

/**
 * Represents a field configuration in a disbursement option
 */
export interface DisbursementFieldConfig {
    fieldName: string;
    fieldLabel: string;
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
 * Payload returned from generatePayloadFromSelection
 */
export interface DisbursementPayload {
    paymentMethod: { text: string | null };
    paymentMailType: { text: string | null };
    bank?: BankDetails[];
    bankVerification?: unknown;
    payee?: {
        name: { text: string | null };
        addresses: Address[];
        contractNumber: { text: string | null };
        fboDetails: { text: string | null };
    };
}

/**
 * Default disbursement update payload
 */
export interface DefaultDisbursementUpdate {
    payeeName: string;
    address: Address;
    fboDetails: string;
}

/**
 * Represents a single disbursement option configuration
 */
export interface DisbursementOption {
    label: string;
    value: string;
    fields: DisbursementFieldConfig[] | null;
    getDefaultPayload?: (
        formDisbursement: FormDisbursement
    ) => DefaultDisbursementUpdate;
    generatePayloadFromSelection: (
        defaultDisbursementInfo: DisbursementParts | DisbursementPayload,
        bankingInFile?: BankingDetails[] | null
    ) => DisbursementPayload;
}

/**
 * Type for the array of disbursement options
 */
export type DisbursementOptions = DisbursementOption[];
