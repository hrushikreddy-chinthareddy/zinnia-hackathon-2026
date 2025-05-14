import { AccountType, Carrier, FormDisbursement } from '@deps/models/case/withdrawal/case';
import { DisbursementParts } from '@deps/models/case/withdrawal/disbursement-types';

import AccountTypes from './form-disbursement-parts/account-type';
import BankAddress from './form-disbursement-parts/address';
import BankBooleanButtonGroup from './form-disbursement-parts/bank-boolean-button-group';
import BankCheckboxField from './form-disbursement-parts/bank-checkbox-field';
import BankTextField from './form-disbursement-parts/bank-text-field';
import SelectBank from './form-disbursement-parts/select-bank';
import SelectParticipantId from './form-disbursement-parts/select-participant-id';

export const DisbursementFields = {
    AccountTypes,
    BankAddress,
    BankTextField,
    SelectBank,
    BankBooleanButtonGroup,
    BankCheckboxField,
    SelectParticipantId,
};

export enum BankingFields {
    BankName = 'bankName',
    BankRoutingNumber = 'bankRoutingNumber',
    ReEnterBankRoutingNumber = 'reEnterBankRoutingNumber',
    IsVoidCheckAttached = 'isVoidCheckAttached',
    FirstTimeExpressCheck = 'firstTimeExpressCheck',
    DoesCheckMeetSecurityRequirements = 'doesCheckMeetSecurityRequirements',
    IsWireApprovalPresent = 'isWireApprovalPresent',
    AccountType = 'accountType',
    BankContactPerson = 'bankContactPerson',
    AccountNumber = 'accountNumber',
    ReEnterAccountNumber = 'reEnterAccountNumber',
    Bank = 'bank',
    BankLocation = 'bankLocation',
    BankPhone = 'bankPhone',
    BankFurtherCreditName = 'bankFurtherCreditName',
    BankFurtherCreditAccount = 'bankFurtherCreditAccount',
    AccountHolder = 'accountHolder',
    Address = 'address',
    ParticipantId = 'participantId',
    CompanyName = 'companyName',
    AcordAttached = 'acordAttached',
    PayeeName = 'payeeName',
    ContractNumber = 'contractNumber',
    TaxId = 'taxId',
    AccountName = 'accountName',
    Zip = 'zip',
    EmailNotification = 'emailNotification',
    SelectIfPayeeIsDifferent = 'selectIfPayeeIsDifferent',
    ConsentAvailable = 'consentAvailable',
    IsDirectDepositValid = 'isDirectDepositValid',
    IsDirectDeposit = 'isDirectDeposit',
    FboDetails = 'fboDetails',
}

// The values that can be impacted by user inputs, in their default forms.
export const getDefaultFormDisbursementValues = (): FormDisbursement => {
    return {
        paymentMethod: { text: null },
        paymentMailType: { text: null },
        bank: [
            {
                accountNumber: '',
                accountType: {
                    text: AccountType.Checking,
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
            },
        ],
        paymentToBrokerageAccount: false,
        brokerage: null,
        payeeType: '',
        voidCheck: null,
        doesCheckMeetSecRequiremnt: null,
        participantId: { text: null },
        payee: null,
        upsAccount: null,
        emailDeliveryNotification: {
            text: false,
        },
        isDifferentPayeeOrAddress: {
            text: false,
        },
        firstTimeExpressCheck: {
            text: false,
        },
    };
};

export enum BankDetailsInputMethod {
    Auto = 'auto',
    Manual = 'manual',
    Envison = 'envison',
}

export const getUpdatedData = (preFillBankInfo: DisbursementParts, method: BankDetailsInputMethod, carrier: string): DisbursementParts => {
    const bankDetailsMap: Record<string, Record<string, Partial<DisbursementParts>>> = {
        [Carrier.MASS]: {
            [BankDetailsInputMethod.Auto]: {
                payeeName: 'MASSMUTUAL ASCEND LIFE INSURANCE COMPANY',
                accountNumber: '4206140138',
                bankName: 'PNC Bank',
                bankRoutingNumber: '041000124',
                accountType: AccountType.Checking,
            },
            [BankDetailsInputMethod.Envison]: {
                payeeName: 'MASSACHUSETTS MUTUAL LIFE INS CO',
                accountNumber: '804788898',
                bankName: 'JP Morgan Chase Bank, N.A.',
                bankRoutingNumber: '021000021',
                accountType: AccountType.Checking,
            },
        },
        [Carrier.FLIC]: {
            [BankDetailsInputMethod.Auto]: {
                payeeName: 'FORETHOUGHT LIFE INS RECEIPT ACCOUNT',
                accountNumber: '4941021958',
                bankName: 'Wells Fargo Bank, N.A',
                bankRoutingNumber: '121000248',
                accountType: AccountType.Checking,
            },
        },
    };

    const carrierDetails = bankDetailsMap[carrier];
    const methodDetails = carrierDetails?.[method];

    if (methodDetails) {
        return {
            ...preFillBankInfo,
            ...methodDetails,
        };
    }

    return preFillBankInfo;
};

export const SUPPLEMENTARY_FIELDS_FILTERS: string[] = [
    BankingFields.AccountType,
    BankingFields.PayeeName,
    BankingFields.BankName,
    BankingFields.BankRoutingNumber,
    BankingFields.AccountNumber,
    BankingFields.FboDetails,
    BankingFields.ContractNumber,
    BankingFields.Address,
];
