import { PartyType } from '@zinnia/api-types/types/sor';

import { FormBeneInfo } from '@deps/components/otp-withdrawal-form/beneficiary-information/beneficiary-info';
import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import { MaritalStatusAllowances } from '@deps/components/otp-withdrawal-form/maritial-status-allowance-withholdings';
import { TrustType } from '@deps/containers/bene-change/components/beneficiary-details/bene-identification/bene-identification.helpers';
import { RelationshipToCoveredPerson } from '@deps/containers/otp/ssw-forms/sbgc/joint-covered-person.helpers';
import { WithdrawalTaskStatus } from '@deps/contexts/OtpWithdrawalFormContext';

import {
    DesignationPresent,
    SignatureValidationTypeWithdrawal,
} from '../renewal/signature-validation';
import { RenewalsFormData, TaskType } from '../task';
import { TaskStatus } from '../task-instance';

// Form data as it comes back from the get digital form API
export interface DigitalFormWithdrawal {
    taskType: TaskType;
    carrier: string;
    status: WithdrawalTaskStatus;
    data: DigitalFormData;
}

export interface DigitalFormData {
    clientCode: string;
    contractNum: string;
    documentNumber: string | null;
    formRequest: FormParts;
    incomingFaxNumber: string | null;
    onbaseCaseId: string | null;
    source: string;
    sysMailFromAddress: string | null;
    taskType: string;
    userId: string | null;
}

export interface ActiveWithdrawalCaseData extends DigitalFormData {
    agentEmailAddress: string | null;
    documentNumber: string;
    onbaseCaseId: string;
}

export type StringTrueFalseNull = 'null' | 'true' | 'false';

export interface FormSpecialInstruction {
    specialInstructionPresent: {
        text: string | null;
    };
    neaBenefitSensitivity: {
        text: StringTrueFalseNull;
    };
}

export interface OwnerAcknowledgement {
    type: {
        text: string | null;
    };
    isSigned: {
        text: boolean | null;
    };
    signDate: {
        text: string | null;
    };
}
export enum maritalStatusType {
    single = 'Single',
    marriedFilingJointly = 'Married Filing Jointly',
    marriedFilingSeparately = 'Married Filing Separately',
}

export enum IrsFormType {
    W4R = 'W4R',
    W4P = 'W4P',
}
export interface FormParts {
    formSource: FormSource;
    formData: FormData;
    formProgram: FormProgram;
    formParty: FormParty;
    formDistribution: FormDistribution;
    formDisbursement: FormDisbursement;
    formRestriction: FormRestriction;
    formTpaAuthorization: FormTpaAuthorization;
    formFullSurrenderAck: FormFullSurrenderAck;
    formSignature: FormSignature;
    formESignatureData?: FormEsignatureData | null;
    formSurrenderingCompany: FormSurrenderingCompany | null;
    formTaxWithholding: FormTaxWithholding;
    formAdditionalWaivers: FormAdditionalWaiver[];
    formTaxIdCertificate?: {
        //-- Not required  set complete object as null
        signatures: [
            {
                isSigned: true;
                signDate: {
                    text: '07/10/2023';
                };
                signExtension: any; //{},
                signName: null;
                signOtherTitle: null;
                signTitle: {
                    text: null;
                };
                signTitles: [
                    {
                        text: null;
                    }
                ];
                signType: {
                    text: 'Financial Professional';
                };
                spousalConsent: {
                    text: null;
                };
            }
        ];
    };
    formLoan: FormLoan;
    formSpecialInstruction: FormSpecialInstruction;
    formIrsData?: FormIrsData[];
    formOL4753Data?: FormOL4753Data | null;
    ownerAcknowledgement?: OwnerAcknowledgement;
    formNigos?: FormNigos | null;
    formReindexingData?: FormReIndexingData | null;
    formComment?: FormComment;
    irsFormType?: IrsFormType;
    formBeneInfo?: FormBeneInfo | null;
    periodicPensionForm?: PeriodicPensionFormType | null;
}

export interface PeriodicPensionFormType {
    maritalStatus: {
        text: string;
    };
    otherIncomeAndPensions: {
        text: string;
        amountType: AmountType;
    };
    claimsAndCredits: {
        text: string;
        amountType: AmountType;
    };
    nonJobIncome: {
        text: string;
        amountType: AmountType;
    };
    otherDeductions: {
        text: string;
        amountType: AmountType;
    };
    address: Address;
    signature: SignatureWithdrawal;
    ssn: string;
}

export interface FormIrsData {
    irsApplicable: boolean;
    irsSpecified: boolean;
    formParty: Party | null;
    irsTaxWithholding?: TaxWithholding[];
    irsSignature?: SignatureWithdrawal;
    irsFormType: IrsFormType;
}

export interface FormOL4753Data {
    isAttached: {
        text: boolean;
    };
    address: Address;
    dob?: {
        text: string | null;
    };
}

// Form data for the case task APIs
export interface ActiveWithdrawalCase extends DigitalFormWithdrawal {
    caseId: string;
    createdDate: string; // ISO Date String,
    data: ActiveWithdrawalCaseData;
    source: string;
    taskId: string;
    updatedDate: string; // ISO Date String
}

export interface ActiveRenewalCase {
    caseId: string;
    taskType: TaskType;
    taskName: string;
    carrier: string;
    status: TaskStatus;
    data: RenewalsFormData;
    source: string;
    taskId: string;
    updatedDate: string; // ISO Date String
}

export interface FundAllocation {
    amount: {
        text: string;
        amountType: AmountType;
    };
    fundCode: string;
    fundName: string;
}

// Withdrawal Form Parts
export interface FormData {
    formExtName: string;
    metaData: {
        formId: string | null;
        formNumber: string | null;
        formType: string;
    };
}

export interface FormDisbursement {
    paymentMethod: {
        text: PaymentMethod | PaymentMailType | null; //-- UI  [Direct, Wire, EFT, List Bill, List Bill/Forward
    };
    paymentMailType: {
        text: PaymentMailType | null; //-- UI //CheckAOR
    };
    bank: BankDetails[];
    brokerage?: Brokerage | null;
    paymentToBrokerageAccount?: boolean; //-- only true for payment type of brokerage
    payeeType: string;
    voidCheck: boolean | null;
    doesCheckMeetSecRequiremnt: boolean | null;
    participantId: {
        text: string | null;
    } | null;
    payee: Payee | null;
    upsAccount: UpsAccount | null;
    emailDeliveryNotification: {
        text: boolean; // true if checked
    };
    isDifferentPayeeOrAddress: {
        text: boolean;
    };
    isWireApprovalPresent?: {
        text: boolean | null;
    };
    firstTimeExpressCheck?: {
        text: boolean | null;
    };
    disbursmentConsent?: DisbursmentConsentInfo;
    ChooseBankingType?: string;
    bankVerification: {
        selectedBankingType: string;
        validationsMap: {
            VOIDED_CHECK: {
                fraudRedFlagsCheck: boolean | null;
                isBlankVoidedCheck: boolean | null;
                hasHandwrittenVOID: boolean | null;
                securityFeaturesPresent: boolean | null;
                ownerNameMatch: boolean | null;
                ownerAddressMatch: boolean | null;
            } | null;
            BANK_LETTERHEAD: {
                isValidBankLetterhead: boolean | null;
                hasBankAddress: boolean | null;
                hasBankOfficialSignature: boolean | null;
                containsHandwrittenBankDetails: boolean | null;
            } | null;
            DIRECT_DEPOSIT_FORM: {
                noAdditionalValidationRequired: boolean | null;
            } | null;
            STARTER_CHECK: {
                noAdditionalValidationRequired: boolean | null;
            } | null;
            NO_BANK_PROOF: {
                noAdditionalValidationRequired: boolean | null;
            } | null;
        };
    } | null;
}
export interface FormDistribution {
    moneyType: {
        text: MoneyType | null; //-distribution instruction fro UI //PRE_TAX_BALANCE, AFTER_TAX_ROTH_BALANCE, PRORATA
    };
    distributionType: null; //-- set null - required for SSW
    oneYearRenewalGurantee: null; //- hard coded
    funds: FundAllocation[];
}

export interface SelectOption {
    isValid: {
        text: boolean | null;
    };
}

export interface FormAdditionalWaiver {
    text: PolicyWaiver;
    selectionOptions: SelectOption;
}

export interface FormFullSurrenderAck {
    isFinancialProfessionAck?: {
        text: boolean | null; //-- set emplty
    };
    isAgentOrBrokerRecommended?: {
        text: boolean | null;
    };
    signature: SignatureWithdrawal[] | null; //-- Not required  set complete object as null];
}

export interface FormLoan {
    isLoanAck: {
        text: boolean | null; //-- UI
    };
}
export interface FormParty {
    parties: Party[];
}

export interface FormProgram {
    clientCode?: string;
    contractNumber?: string;
    withdrawType: {
        text: string;
    };
    amountQualifierType?: string | null;
    program?: {
        text: string;
    };
    programType: {
        text: string;
    };
    programSubType: {
        text: string | null;
    };
    maturityGuaranteePeriod?: {
        text: string | null;
    };
    programFrequency?: ProgramFrequency | null;
    rollover?: string | null;
    rmd?: RMD | null;
    qcd?: QCD[] | null;
    terminateprograms?: Terminateprogram[] | null;
    programAmount?: {
        text: string | null;
        amountType: AmountType;
    };
    partialAmount: {
        text: string | null;
        amountType: AmountType;
    };
    partialPercent?: {
        text: string | null;
        amountType: AmountType | null;
    };
    partialGrossAmount: {
        text: string | null;
        amountType: AmountType | null;
    };
    partialNetAmount: {
        text: string | null;
        amountType: AmountType | null;
    };
    gmwbAmount: {
        text: string | null;
        amountType: AmountType | null;
    };
    glwbType?: {
        text: string | null;
    };
    processRequestType?: { text: ProcessRequestType }[] | null;
    isValidAsOfDate?: boolean;
    accountCloseReason?: {
        text: string | null; // This can be a comma-separated string of values :(
    };
    programSubTypeOptions?: string | null;
    asOfDate?: {
        text: string | null;
    };
    isContractReplaced?: {
        text: boolean | null;
    };
    transactionType?: {
        text: string | null;
    };
    transactionSubType?: {
        text: string | null;
    };
    transactionFormId?: {
        text: number | null;
    };
    transactionFormNumber?: {
        text: string | null;
    };
    transactionFormName?: {
        text: string | null;
    };
    transactionDisplayName?: {
        text: string | null;
    };
    isPrevNigoChecked?: boolean;
}

export type ProgramFrequency = {
    frequency: {
        text: Frequency;
    };
    beginDate: {
        text: string;
    };
    fixedPeriodYear: {
        text: string | null;
    };
    duration?: {
        text: string | null;
    };
};

export enum SSWType {
    FixDollar = 'FixDollar',
    PercentOfAmountValue = '% of A.V.',
    AnnualFree = 'AnnualFree',
    FixPeriod = 'FixPeriod',
    InterestEarningDividendsGains = 'InterestEarningDividendsGains',
    GMWB = 'GMWB',
    SingleLifetimeIncomeOption = 'SingleLifetime',
    JointLifetimeIncomeOption = 'JointLifetime',
    VariableAnnuity = 'Variable Annuity',
}

export interface RMD {
    rmdType: RMDType | null;
    rmdSubType: null;
    rmdRelationship: null;
    ralationshipDate: null;
    rmdAmount: null;
    fullName: string | null;
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    dob: { text: string | null };
    isJointLifeExpectancy: boolean;
    isOneTimeWithdrawal?: boolean;
    rmdPrograms: RMDProgram[];
    taxId: { text: string | null };
}

export interface QCD {
    charityName: string;
    amount: {
        text: string;
        amountType: 'DOLLAR';
    };
    address: Address;
}

export interface Terminateprogram {
    allocationId: {
        text: number;
    };
    startDate: {
        text: string;
    };
}
export interface RMDProgram {
    startDate: {
        text: string;
    };
    frequency: {
        text: Frequency;
    };
    duration: {
        text: string;
    };
    amount: {
        text: string | null;
        amountType: AmountType;
    };
}

export interface FormRestriction {
    restrictions: Restriction<RestrictionOption>[];
    hardship: Restriction<HardshipOption>[];
    emergency: Restriction<EmergencyOption>[];
}

export interface FormSignature {
    isSpousalConsentRequired?: { text: boolean } | null; //-- default null CMW-10977
    isCheckCSNLValid?: boolean | null;
    signatures: SignatureWithdrawal[];
    signVerificationReason?: RegReason<SignVerificationReason>[];
}

export interface FormSource {
    businessKey: string;
    channel: {
        text: string | null;
    };
    cutOffTimeExpireInd: boolean;
    formsDBId: string | null;
    receivedDate: string;
    receivedDateTime: string;
    sourceSysId: string | null;
    unstructuredFormInd: boolean;
}

export interface FormTaxWithholding {
    taxWithholding?: TaxWithholding[] | undefined;
}

export interface FormTpaAuthorization {
    isAuthorization: {
        text: boolean | null;
    };
    isAgreementAttached: {
        text: string | null;
    };
    signOf: {
        text: string | null;
    };
    signature: SignatureWithdrawal;
}

// Error format on form parts
export interface FormValidationErrors {
    [key: string]: string;
}

// Smaller pieces of the above form parts
export interface Address {
    isAddressChanged?: boolean;
    addressLine1: string;
    addressLine2?: string | null;
    addressLine3?: string | null;
    addressLine4?: string | null;
    addressType: AddressTypes;
    city: string | null;
    country?: string | null;
    state: string;
    zip: string;
    zipPlusFour?: string | null;
    ssn?: string;
}

export interface BankDetails {
    accountNumber?: string; //-- UI
    reEnterAccountNumber?: string; //-- UI
    accountType?: {
        text: AccountType | '';
    };
    bankContactPerson?: string;
    bankFurtherCreditAccount?: string;
    bankFurtherCreditName?: string;
    bankInfoCompleteInd?: string;
    bankLocation?: string;
    bankName?: string; //-- UI
    bankPhone?: string;
    nameOnBankAccount?: string; //-- UI
    routingNumber?: string; //-- UI
    reEnterBankRoutingNumber?: string; //-- UI
    maskedAccountNumber?: string | null;
    isDirectDeposit?: {
        text: boolean;
    };
    isDirectDepositValid?: {
        text: boolean | null;
    };
}

export type Brokerage = {
    acordAttached: boolean | null;
    address: Address;
    accountNumber: string | null;
    companyName: string | null;
};

export interface Party {
    partyType?: PartyType;
    partyRoleType: PartyRoles;
    firstName: string;
    middleName: string;
    lastName: string;
    fullName: string;
    suffix?: string | null;
    relationshipToOwnerAnnutant?: RelationshipToCoveredPerson;
    withdrawalPayoutOption?: PayoutOptions;
    dob?: {
        text: string | null;
    };
    taxId?: string;

    email?: string | null;
    employer?: string | null;
    maritalStatus: {
        text: maritalStatusType | null;
    };
    addresses: Address[];
    phones: Phone[];
    trustType?: TrustType;
}

export interface Phone {
    phoneCountry?: string | null;
    phoneNumber: string | null;
    phoneTypeDesc: string | null;
    phoneType: {
        text: PhoneTypes; //-party API phone type
    };
}

export interface Restriction<T> {
    selectionOptions: {
        // will be empty for most options
        SeveranceDate?: { text: string }; // populated for the 'Severance' restriction option
        DistribUnforseenDesc?: { text: string }; // populated for the 'BeyondControl' emergency option
    };
    text: T;
}

export interface RegReason<T> {
    text: T;
}
export interface SignatureWithdrawal {
    isSigned: boolean | null; // true;
    signDate: {
        text: string | null; // '07/10/2023';
    };
    signExtension: any;
    signName: string | null; // null;
    signOtherTitle: null;
    signTitle: {
        text: string | null;
    };
    signTitles: [
        {
            text: null;
        }
    ];
    signType: {
        text: SignatureValidationTypeWithdrawal | null; //-- Owner/Joint Owner/Spouse/Notary/Irrevocable Beneficiary/Power of Attorney
    };
    spousalConsent: {
        text: boolean | null;
    };
    isSignatureValid?: boolean | null; // CMW-10977
    signatureComment?: string; // CMW-10977
    isNotaryValid?: boolean | null;
    signGuaranteeStamp?: {
        text: string | null;
    };
    commissionExpiryDate?: {
        text: string | null;
    };
    ssn?: {
        text: string | null;
    };
    isSignatureCityProvided?: {
        text: boolean | null;
    };
    isDesignationPresent?: DesignationPresent | boolean | null;
}

export interface TaxWithholding {
    place: {
        text: string; //'Federal'; // State
    };
    type: {
        text: string; //'No Tax Withholding'; //Minimum Tax Withholding - selectMin button
        //Specified Tax Withholding -- user is giving value in $ or %
        //No Tax Withholding -- Don't Withh button
        //No Tax Withholding Allowed
        //Take Inputted Value
    };
    amount: TaxWithholdingAmount;
    additionalAmount: TaxWithholdingAmount;
    filingStatus: {
        text: string | null;
    };
    exemption?: {
        text: string | null;
    };
    noOfallowances?: {
        text: string; // any positive number default 0
    };
    multipleAllowances?: {
        text: boolean | null;
    };
    allowances?: { text: MaritalStatusAllowances }[] | null;
}

export type TaxWithholdingAmount = {
    text: string | null; //'0';
    amountType: AmountType | null; //null; //-- DOLLAR/PERCENT
};

export interface Transaction {
    TransactionType: string;
    TypeDesc: string;
    TransactionDate: string; //MM/DD/YYYY
    Status: TransactionStatus;
    TransactionAmount: number;
}

export enum TransactionStatus {
    Complete = 'Complete',
    Pending = 'Pending',
    Done = 'Done',
}

export interface TransactionHistory {
    Items: Transaction[];
}

// Existing RMD / SSW programs
export interface SpecialProgram {
    allocationDetails: SpecialProgram[];
    dbAmount: number;
    dbFixedPct: number;
    dbNonLifePayoutExclAmt: number;
    dbPctGMWBPayment: number;
    dbPriorMRDAmt: number;
    policyNumber: number;
    cvgId: number;
    typeOfAlloc: number;
    startDate: string;
    termDate: string;
    mode: string;
    nextDate: string;
    lastTxnDate: string;
    termBy: string;
    modePeriods: number;
    amountType: number;
    distributionCode: string;
    allocationId: number;
    firstPayYear: string;
    firstPayYearDate: string;
    calcType: number;
    count: number;
    duration: number;
    dcaSweep: number;
    earningsRefreshDate: string;
    loanId: number;
    grossDisbInd: number;
    programCounter: number;
    moneySrcID: number;
    firstNextDate: string;
    waive: number;
    waiveMVA: number;
    waiveBonusRecap: number;
    refundOnly: number;
    treatAsNonTaxable: boolean;
    waiveLimits: number;
    evaluateGMWBAmt: number;
    advisorConsultation: number;
    featureChange: number;
    taxExclType: number;
    firstSSWBasis: number;
    priorMRDAmtType: number;
    batch: number;
}

export interface FormSurrenderingCompany {
    qualType: {
        text: string;
    };
    multipleQualType: {
        text: boolean;
    };
    authorizedOfficerSignature: {
        text: boolean | null;
    };
    loa: {
        text: boolean | null;
    };
    loaSignDate?: {
        text: string | null;
    };
    isTitlePresent: {
        text: boolean | null;
    };
    registrationType: {
        text: boolean | null;
    };
    nonRegTypeReason: RegReason<NonRegTypeReason>[] | [];
}
export interface Payee {
    name: {
        text: string | null;
    };
    contractNumber: {
        text: string | null;
    };
    fboDetails?: {
        text: string | null;
    };
    addresses: Address[];
    taxId?: {
        text: string;
    };
}

export interface DisbursmentConsentInfo {
    isConsent: {
        text: boolean | null;
    };
    name: {
        text: string;
    };
    isSigned: {
        text: boolean | null;
    };
    signTitle: {
        text: string;
    };
    signDate: {
        text: string;
    };
}

export interface UpsAccount {
    accountNumber: {
        text: string;
    };
    accountName: {
        text: string;
    };
    zip: {
        text: string;
    };
}

export type FormComment = {
    comment: string;
};

// ENUMS for various parts of the form
export enum AccountCloseReason {
    ContractAttached = 'CONTRACT_ATTACH',
    ContractLost = 'CONTRACT_LOST',
    Surrender = 'SURRENDER',
}

export enum PolicyWaiver {
    NURSING_HOME_AND_HOSPITAL = 'NURSING_HOME_AND_HOSPITAL',
    TERMINAL_ILLNESS = 'TERMINAL_ILLNESS',
}

export enum AccountType {
    Checking = 'Checking',
    Savings = 'Savings',
}

// Status of the form.  Used to differentiate between submit, cancel, and save as draft
export enum CaseStatus {
    Draft = 'DRAFT', // Initial status of an empty form
    Pending = 'PENDING', // Status of a form that has been started, but not submitted (Save as Draft)
    Submit = 'IN_PROGRESS', // Status of a form that is ready to be submitted
    CompleteDoNotUse = 'COMPLETE', // Do not use from the UI.
    Cancelled = 'CANCELLED', // Used to remove a form from pending status (we do not delete)
}

// FormRestriction
export enum EmergencyOption {
    UnexpectedIllness = 'financialhardship',
    LossOfProperty = 'propertyloss',
    BeyondControl = 'unforseencircumstances',
    Empty = '',
}

// FormRestriction
export enum HardshipOption {
    PurchaseResidence = 'purchresidence',
    Eviction = 'eviction',
    Foreclosure = 'foreclosure',
    MedicalExpenses = 'medicalexpenses',
    Education = 'education',
    Funeral = 'funeral',
    CasualtyExpense = 'casualtyexpense',
    FederalDisaster = 'federaldisaster',
    Empty = '',
}

export enum MoneyType {
    PreTaxBalance = 'Pre Tax',
    AfterTaxRothBalance = 'After Tax',
    ProRata = 'Prorata',
    Specific = 'Specific',
}

export enum FundWithdrawnMethod {
    Default = 'Default',
    Prorata = 'Prorata',
    SpecifyFunds = 'Specific',
    Empty = '',
}

export enum RMDFundWithdrawnMethod {
    Dollar = 'Dollar',
    Percent = 'Percent',
}

// FormParty
export enum MaritalStatus {
    Single = 'Single',
    Married = 'Married',
    Widowed = 'Widowed',
}

// FormDisbursement
export enum PaymentMailType {
    Check = 'Check', // now it is updated from CheckAOR to Check only
    ExpressCheck = 'ExpressCheck',
}

// FormDisbursement
export enum PaymentMethod {
    Brokerage = 'Brokerage',
    Direct = 'Direct',
    Wire = 'Wire',
    EFT = 'EFT',
    ListBill = 'List Bill',
    ListBillForward = 'List Bill/Forward',
    DTCC = 'DTCC',
    AlternatePayeeAddress = 'ALTERNATE_PAYEE',
}

export enum ProcessRequestType {
    Immediately = 'IMMED',
    NoLongerSubject = 'NOCDSC',
    AsOfDate = 'AS_OF_DATE',
}

export enum ProgramSubType {
    TotalFreeWithdrawal = 'Total Free Withdrawal',
    MaturingGuranteePeriod = 'Maturity Guarantee Period',
    Dollar = 'Dollar',
    Percentage = 'Percentage',
    Prorata = 'Prorata',
    Partial = 'Partial',
    FullSurrender = 'Full Surrender',
    PercentageofAV = '% of A.V.',
    MaximumAmount = 'Maximum Amount',
}

export enum Program {
    OFT = 'Outgoing Transfer',
    WITHDRAWAL = 'Withdrawal',
}

// FormProgram
export enum ProgramType {
    Full = 'Full',
    FullSurrender = 'Full Surrender',
    Partial = 'Partial',
    TotalFreeAmt = 'TotalFreeAmt',
    GMWB = 'GMWB',
    Withdrawal = 'Withdrawal',
    WITHDRAWAL = 'WITHDRAWAL',
    GrossWithdrawal = 'GrossWithdrawal',
    NetWithdrawal = 'NetWithdrawal',
    PartialDollar = 'Partial Dollar',
    PartialPercent = 'Partial Percent',
    PenaltyFreeAmount = 'Penalty Free Amount',
    MaximumFreeAmount = 'Maximum Free Amount',
    OFT = 'OFT',
    SSW = 'SSW',
}

// FormRestriction
export enum RestrictionOption {
    Age595 = 'age595',
    Age525 = 'age525',
    OverAge705 = 'age705',
    Disabled = 'disabled',
    Death = 'death',
    Severance = 'severance',
    PlanTermination = 'plantermination',
    InternalRevenueCode72 = 'internalrevenuecode72',
    UnrestrictedAccount = 'unrestrictedaccount',
    InServiceDistribution = 'inscvcdistrib',
    AdoptionChildBirth = 'adoptionchildbirth',
    QualifiedReservist = 'qualreservistdistribution',
    EligibleDistribution = 'eligibledistribution',
    Empty = '',
    Hardship = 'hardship',
    Others = 'others',
    DeathInheritedIRA = 'deathinheritedira',
    DeathDeferredSettlement = 'deathdeferredsettlement',
}

export enum PayoutOptions {
    level = 'LEVEL',
    increasing = 'INCREASING',
}

export enum TaxWithholdingPlace {
    Federal = 'Federal',
    State = 'State',
}

// amount details
export enum WithdrawalType {
    Gross = 'GROSS',
    Net = 'NET',
}
// party roles
export enum PartyRoles {
    OWNER = 'OWNER',
    AGENT = 'AGENT',
    ANNUITANT = 'ANNUITANT',
    JOINT_OWNER = 'JOINT_OWNER',
    PAYEE = 'PAYEE',
    ROLLOVER_PAYEE = 'ROLLOVER_PAYEE',
    BENEFICIARY = 'BENEFICIARY',
    JOINTCOVEREDPERSON = 'JOINT_COVERED_PERSON',
    GLWB_FIRST_COVERED_PERSON = 'COVERED_PERSON_1',
    GLWB_SEC_COVERED_PERSON = 'COVERED_PERSON_2',
}

export enum LifeCadPartyRoles {
    ServicingAgent = 'Servicing Agent',
    AgentofRecord = 'Agent of Record',
    Broker = 'Broker',
    PrimaryAnnuitant_Insured = 'Primary Annuitant / Insured',
    PrimaryOwner = 'Primary Owner',
    JointOwner_SameAddress = 'Joint Owner, Same Address',
    Beneficiary = 'Irrevocable Beneficiary',
}

export enum LifeCadPartyPersonType {
    Individual = 'Individual',
    Company = 'Company',
}

export enum AddressTypes {
    DEFAULT = 'DEFAULT',
    MAILING_ADDRESS = 'MAILING_ADDRESS',
    AGENT_ADDRESS = 'AGENT_ADDRESS',
    RESIDENTIAL_ADDRESS = 'RESIDENCE',
}
export enum PhoneTypes {
    Owner_Phone_Day = 'Owner_Phone_Day',
    Owner_Phone_Home = 'Owner_Phone_Home',
}
export enum WithholdingType {
    MinimumTaxWithholding = 'Minimum Tax Withholding',
    NoTaxWithholding = 'No Tax Withholding',
    NoTaxWithholdingAllowed = 'No Tax Withholding Allowed',
    SpecifiedTaxWithholding = 'Specified Tax Withholding',
}

export enum AmountType {
    Dollar = 'DOLLAR',
    Percent = 'PERCENT',
}

export enum DateFieldType {
    MaturityDate = 'MATURITY_DATE',
}

// RMD Form
export enum Frequency {
    None = 'None',
    Monthly = 'Monthly',
    Quarterly = 'Quarterly',
    SemiAnnually = 'SemiAnnually',
    Annually = 'Annually',
}

export enum RMDType {
    AutoRMD = 'Auto RMD',
    CalculateRMD = 'Calculate RMD',
    OneTimeRMD = 'One Time RMD',
}

export enum RMDProgramType {
    Active = 'Active',
    Terminate = 'Terminate',
}

export enum QualTypes {
    NonQualified = 'Non-Qualified',
    ConvertedRothIRA = 'Converted Roth IRA',
    CustInhIRA = 'Cust Inh IRA',
    CustInhRothIRA = 'Cust Inh Roth IRA',
    CustRolloverIRA = 'Cust Rollover IRA',
    CustSARSEPIRA = 'Cust SAR/SEP IRA',
    CustSimpleIRA = 'Cust Simple IRA',
    CustSpousalIRA = 'Cust Spousal IRA',
    CustodialIRA = 'Custodial IRA',
    CustodialIRASEP = 'Custodial IRA-SEP',
    CustodialQLACIRA = 'Custodial QLAC IRA',
    CustodialRothIRA = 'Custodial Roth IRA',
    InheritedIRA = 'Inherited IRA',
    InheritedRothIRA = 'Inherited Roth IRA',
    IRARegular = 'IRA-Regular',
    IRARollover = 'IRA-Rollover',
    IRASEP = 'IRA-SEP',
    IRASimple = 'IRA-Simple',
    IRASpousal = 'IRA-Spousal',
    QLACIRA = 'QLAC IRA',
    RothIRA = 'Roth IRA',
    a401 = '401(a)',
    aSchedA401 = '401(a) - Sched A',
    g401 = '401(g)',
    k401 = '401(k)',
    b403 = '403(b)',
    e3412 = '412(e)(3)',
    DeferredComp457 = '457 Deferred Comp.',
    CorporatePension = 'Corporate Pension',
    GroupTSA = 'Group TSA',
    KEOGHHR10 = 'KEOGH/HR10',
    MoneyPurchasePensionPlan = 'Money Purchase Pension Plan',
    PensionPlan = 'Pension Plan',
    ProfitSharingPlan = 'Profit Sharing Plan',
    TargetBenefitPlan = 'Target Benefit Plan',
    ServiceCredits = 'Service credits',
    BrokerageAccountNon1035Exchange = 'Brokerage Account - Non 1035 Exchange',
}

export enum FASTQualTypes {
    INDIVIDUALRETIREMENTACCOUNTREGULAR = 'INDIVIDUALRETIREMENTACCOUNTREGULAR',
    INDIVIDUALRETIREMENTACCOUNTSPOUSAL = 'INDIVIDUALRETIREMENTACCOUNTSPOUSAL',
    INDIVIDUALRETIREMENTACCOUNTROLLOVER = 'INDIVIDUALRETIREMENTACCOUNTROLLOVER',
    ROTHINDIVIDUALRETIREMENTACCOUNT = 'ROTHINDIVIDUALRETIREMENTACCOUNT',
    CUSTODIALINDIVIDUALRETIREMENTACCOUNT = 'CUSTODIALINDIVIDUALRETIREMENTACCOUNT',
    CUSTODIALROTHINDIVIDUALRETIREMENTACCOUNT = 'CUSTODIALROTHINDIVIDUALRETIREMENTACCOUNT',
    CUSTODIALROLLOVERINDIVIDUALRETIREMENTACCOUNT = 'CUSTODIALROLLOVERINDIVIDUALRETIREMENTACCOUNT',
    QUALIFIED = 'QUALIFIED',
    NONQUALIFIED = 'NONQUALIFIED',
    SIMPLIFIEDEMPLOYEEPENSIONINDIVIDUALRETIREMENTACCOUNT = 'SIMPLIFIEDEMPLOYEEPENSIONINDIVIDUALRETIREMENTACCOUNT',
    INHERITEDINDIVIDUALRETIREMENTACCOUNT = 'INHERITEDINDIVIDUALRETIREMENTACCOUNT',
    INHERITEDROTHINDIVIDUALRETIREMENTACCOUNT = 'INHERITEDROTHINDIVIDUALRETIREMENTACCOUNT',
    NONQUALIFIEDSTRETCH = 'NONQUALIFIEDSTRETCH',
    Q403B = 'Q403B',
}

export enum NonRegTypeReason {
    JointOwnerAbsent = 'JOINT_OWNER_ABSENT',
    MissingInfoLoa = 'MISSING_INFO_LOA',
    IncorrectNameAnnuitant = 'INCORRECT_NAME_ANNUITANT',
}

export enum Carrier {
    SBGC = 'SBGC',
    FLIC = 'FLIC',
    MASS = 'MASS',
    DLIC = 'DLIC',
    NASU = 'NASU',
    GDMN = 'GDMN',
    RSLN = 'RSLN',
    WELB = 'WELB',
    ULPC = 'ULPC',
    GLCO = 'GLCO',
    USAA = 'USAA',
    PRDN = 'PRDN',
}

export const ParticipantCompanies = [
    {
        code: '3179',
        companyName: 'AIG ANNUITIES-VAR & IDX/VAR.ANN.LIFE INS CO (3179)',
    },
    {
        code: '4516',
        companyName: 'AMERICAN GENERAL LIFE/AIG ANN.-VAR&INDEX (4516)',
    },
    {
        code: '4507',
        companyName: 'AMERICAN GENERAL LIFE/AIG ANN-SVC ONLY FIX (4507)',
    },
    {
        code: '0000',
        companyName: 'Disburse to Broker',
    },
    {
        code: '4535',
        companyName: 'AXA EQUITABLE LIFE INSURANCE COMPANY (4535)',
    },
    {
        code: '4581',
        companyName: 'JACKSON NATIONAL LIFE INS. CO. /BROOKE LIFE (4581)',
    },
    {
        code: '4584',
        companyName: 'JACKSON NATIONAL LIFE INS. CO. OF NEW YORK (4584)',
    },
    {
        code: '4552',
        companyName: 'JACKSON NATIONAL LIFE INSURANCE COMPANY (4552)',
    },
    {
        code: '3165',
        companyName: 'JEFFERSON NATIONAL LIFE INS. CO/J.N.L. INS. (3165)',
    },
    {
        code: '4500',
        companyName: 'LINCOLN NATIONAL LIFE INSURANCE COMPANY (4500)',
    },
    {
        code: '4530',
        companyName: 'NATIONWIDE LIFE INS. CO/INCOME PRODUCTS (4530)',
    },
    {
        code: '4514',
        companyName: 'NATIONWIDE LIFE INSURANCE CO. (4514)',
    },
    {
        code: '3881',
        companyName: 'NATIONWIDE LIFE INS. CO/N.WIDE ADV. SOLs. (3881)',
    },
    {
        code: '4571',
        companyName: 'NEW YORK LIFE INS & ANNUITY CORP/FIXED CORP (4571)',
    },
    {
        code: '6545',
        companyName: 'PACIFIC LIFE & ANNUITY CO./LIFE DIVISION (6545)',
    },
    {
        code: '4589',
        companyName: 'PACIFIC LIFE & ANNUITY COMPANY (4589)',
    },
    {
        code: '1187',
        companyName: 'PACIFIC LIFE INSURANCE CO./LIFE DIV. LYNCH (1187)',
    },
    {
        code: '4616',
        companyName: 'PACIFIC LIFE INSURANCE CO./LIFE DIVISION (4616)',
    },
    {
        code: '4532',
        companyName: 'PACIFIC LIFE INSURANCE COMPANY (4532)',
    },
    {
        code: '4561',
        companyName: 'TRANSAMERICA FINANCIAL INSURANCE COMPANY (4561)',
    },
    {
        code: '4566',
        companyName: 'TRANSAMERICA LIFE INSURANCE COMPANY (4566)',
    },
    {
        code: '4567',
        companyName: 'TRANSAMERICA PREMIER LIFE INSURANCE CO./WRL (4567)',
    },
    {
        code: '4564',
        companyName: 'TRANSAMERICA PREMIER LIFE INSURANCE COMPANY (4564)',
    },
    {
        code: '4517',
        companyName: 'US LIFE/AIG ANNUITIES (NY) - VARIABLE (4517)',
    },
    {
        code: '4506',
        companyName: 'VENERABLE INSURANCE AND ANNUITY COMPANY (4506)',
    },
    {
        code: '5377',
        companyName: 'VOYA INSTITUTIONAL TRUST COMPANY/IFS (5377)',
    },
    {
        code: '4635',
        companyName: 'VOYA RETIREMENT INS. AND ANNUITY CO./VOYA (4635)',
    },
    {
        code: '4740',
        companyName: 'VOYA RETIREMENT INS. & ANN. CO./VOYA ANN. (4740)',
    },
    {
        code: '4709',
        companyName: 'MIDLAND NATIONAL LIFE INSURANCE COMPANY (4709)',
    },
    {
        code: '8367',
        companyName: 'NORTH AMERICAN COMP FOR LIFE AND HEALTH INS (8367)',
    },
    {
        code: '4598',
        companyName: 'PRUCO LIFE INSURANCE COMPANY OF NEW JERSEY (4598)',
    },
    {
        code: '4597',
        companyName: 'PRUCO LIFE INSURANCE COMPANY (4597)',
    },
    {
        code: '4504',
        companyName: 'PRUDENTIAL ANNUITIES LIFE ASSURANCE CORP (4504)',
    },
    {
        code: '4596',
        companyName: 'THE PRUDENTIAL INSURANCE COMPANY OF AMERICA (4596)',
    },
    {
        code: '4569',
        companyName: 'AMERICAN NATIONAL INSURANCE COMPANY (4569)',
    },
    {
        code: '4061',
        companyName: 'USAA Life Insurance Company(4061)',
    },
    {
        code: '4062',
        companyName: 'USAA Life Insurance Company of New York(4062)',
    },
    {
        code: '4621',
        companyName: 'FIRST SYMETRA NATIONAL LIFE INSURANCE CO. O (4621)',
    },
    {
        code: '4503',
        companyName: 'PROTECTIVE LIFE INSURANCE COMPANY (4503)',
    },
    {
        code: '4540',
        companyName: 'PROTECTIVE LIFE AND ANNUITY INSURANCE CO (4540)',
    },
    {
        code: '3286',
        companyName: 'GLOBAL ATLANTIC / FORETHOUGHT LIFE (3286)',
    },
    {
        code: '4720',
        companyName: 'ATHENE ANNUITY AND LIFE COMPANY (4720)',
    },
    {
        code: '1822',
        companyName:
            'EQUITABLE FINANCIAL LIFE INSURANCE COMPANY OF AMERICA (1822)',
    },
    {
        code: '4609',
        companyName: 'SYMETRA LIFE INSURANCE COMPANY (4609)',
    },
    {
        code: '5949',
        companyName: 'MASSMUTUAL ASCEND LIFE INSURANCE COMPANY (5949)',
    },
    {
        code: '4533',
        companyName: 'GUARDIAN INSURANCE AND ANNUITY COMPANY (4533)',
    },
    {
        code: '0226',
        companyName: 'National Financial Services (0226)',
    },
];

export enum SignVerificationReason {
    Single = 'SINGLE',
    MarriedWithERISA = 'MARRIED_SUBJECT_TO_ERISA',
    MarriedWithoutERISA = 'MARRIED_NOT_SUBJECT_TO_ERISA',
}

export enum SortOrder {
    Asc = 'ASC',
    Desc = 'DESC',
}

export enum DairyNoteType {
    ADMINISTRATIVE = 'Administrative',
    BANKRUPTCY = 'Bankruptcy',
    CONTRACTINQUIRY = 'Contract Inquiry',
    CARRIERAPPOINTMENTCOMPLETED = 'Carrier Appointment Completed',
    CARRIERAPPOINTMENTREQUESTED = 'Carrier Appointment Requested',
    CARRIERAPPOINTMENTTERMINATED = 'Carrier Appointment Terminated',
    CARRIERAPPROVALRECEIVED = 'Carrier Approval Received',
    CARRIEROFFERRECEIVED = 'Carrier Offer Received',
    CARRIERQUOTEREQUESTED = 'Carrier Quote Requested',
    CONTRACTEXECUTED = 'Contract Executed',
    CONTRACTTERMINATED = 'Contract Terminated',
    DELIVERY = 'Delivery',
    FORMALAPPLICATIONRECIVED = 'Formal Application Received',
    GARNISHMENTS = 'Garnishments',
    HOMEOFFICEEMPLOYEE = 'Home Office Employee',
    ILLUSTRATIONREQUESTED = 'Illustration Requested',
    INCOMINGREPLACEMENT = 'Incoming Replacement',
    INFORMALINQUIRYRECEIVED = 'Informal Inquiry Received',
    LEGAL = 'Legal',
    LICENSEEXPIRED = 'License Expired',
    LICENSETERMINATED = 'License Terminated',
    NEWBUSINESS = 'New Business',
    NEWLICENSERECEIVED = 'New License Received',
    ORIGINALDEPOSITDATE = 'Original Deposit Date',
    OUTGOINGREPLACEMENT = 'Outgoing Replacement',
    POLICYADMIN = 'Policy Admin',
    POLICYISSUED = 'Policy Issued',
    RECRUITCANDIDATE = 'Recruit Candidate',
    REFERREDTOUNDERWRITING = 'Referred To Underwriting',
    REQUIREMENT = 'Requirement',
    SEMINAR = 'Seminar',
    SPECIALMARKETCODE = 'Special Market Code',
    UNDERWRITING = 'Underwriting',
}

export interface FormNigos {
    nigos: NigoMessages[];
}

export interface NigoMessages {
    exceptionId: string;
    messages: string[];
}

export interface FormReIndexingData {
    lob: string | null;
    docHandle: string | null;
    docTypeToReindex?: string | null;
    notes: string | null;
}

export type EnterpriseParty = {
    partyRole: string;
    partyId: string;
    percentage: number;
    bankId: string;
    paymentForm: string;
};

export type SystematicSpecialPrograms = {
    arrangementType: string;
    arrangementId: string;
    allocationOptionType: string | null;
    reason: string;
    numberOfOccurrence: number | null;
    disbursementType: string;
    status: string;
    paymentForm: string;
    frequency: string;
    requestedDate: string;
    startDate: string;
    endDate: string;
    previousProgramDate: string | null;
    nextProgramDate: string;
    amountType: string;
    amount: number;
    party: EnterpriseParty[];
};
