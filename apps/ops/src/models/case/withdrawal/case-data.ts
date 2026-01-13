import {
    CaseStatus,
    EmergencyOption,
    MoneyType,
    PaymentMethod,
    RestrictionOption,
    WithdrawalType,
    AccountType,
    DigitalFormWithdrawal,
    PartyRoles,
    AddressTypes,
    PhoneTypes,
    AmountType,
    PolicyWaiver,
    IrsFormType,
    TaxWithholdingPlace,
    WithholdingType,
    maritalStatusType,
} from '@deps/models/case/withdrawal/case';

import { SignatureValidationTypeWithdrawal } from '../renewal/signature-validation';
import { TaskType } from '../task';

export const CaseDetails: DigitalFormWithdrawal = {
    taskType: TaskType.Withdrawal,
    carrier: 'SBGC',
    status: 'DRAFT' as CaseStatus,
    data: {
        documentNumber: '20230714-EM-479404',
        source: 'DigitalPortal', //-- hardcoded
        contractNum: '571016565', //-- ONBASE
        userId: 'abc121243', //-- login user
        onbaseCaseId: '9280926', //-- ONBASE
        clientCode: 'SBGC',
        incomingFaxNumber: '', //-- ONBASE
        sysMailFromAddress: '', //-- ONBASE
        taskType: 'WithdrawalTask', //-- hardcoded
        formRequest: {
            formSource: {
                businessKey: '20230712-EM-786626',
                channel: {
                    text: 'EMAIL', //-- ONBASE
                },
                cutOffTimeExpireInd: true, //-- always false
                formsDBId: '',
                receivedDate: '2023-07-12',
                receivedDateTime: '2023-07-11T16:51:19-05:00', // - ONBASE
                sourceSysId: 'ONBASE',
                unstructuredFormInd: true, // -- always false
            },
            formData: {
                formExtName: 'ANNUITY CONTRACT WD 327794022-V20200325-DIGITAL',
                metaData: {
                    formId: '99999', //-- hardcoded
                    formNumber: null,
                    formType: 'ANNUITY CONTRACT WD 327794022-V20200325-DIGITAL',
                },
            },
            formProgram: {
                clientCode: 'SBGC', //-- ONBASE
                contractNumber: '5450009139', //-onbse API
                withdrawType: {
                    //--Amount Details UI section
                    text: 'NET' as WithdrawalType, //--NET/GROSS
                },
                amountQualifierType: null, //--NET/GROSS
                program: {
                    text: 'Withdrawal', //-hard coded
                },
                programType: {
                    text: 'Partial', //--Amount type UI secton (cmw-7128)
                },
                programSubType: {
                    text: null, //--distribution insturction -examples progra, pre-tax, na ect. (cmw-7205)
                },
                programFrequency: null, //--hard coded
                rollover: null, //--hard coded
                rmd: null, //---hard coded
                programAmount: { text: null, amountType: AmountType.Dollar }, //--hard coded  , Camunda populate it based on programType
                partialAmount: {
                    text: '--blank--', //--need to confirm
                    amountType: AmountType.Dollar,
                },
                partialPercent: {
                    text: null,
                    amountType: AmountType.Percent,
                },
                partialGrossAmount: {
                    text: null,
                    amountType: AmountType.Dollar, //-- DOLLAR/PERCENT
                },
                partialNetAmount: {
                    text: '1200',
                    amountType: AmountType.Dollar, //-- DOLLAR/PERCENT
                },
                gmwbAmount: {
                    text: '1200',
                    amountType: AmountType.Dollar, //-- DOLLAR/PERCENT
                },
                processRequestType: null, //-- hardcoded
                isValidAsOfDate: true, //-- always true
                accountCloseReason: {
                    //--distribution reason details section of UI -- SURRENDER/CONTRACT_ATTACH/CONTRACT_LOST
                    text: null, //-- purchase of house. etc discrition of distribution reason
                },
                programSubTypeOptions: null,
                asOfDate: {
                    //--amount detail effective date -- ?? Anoop will confirm
                    text: null, //example 7/27/2023
                },
            },
            formParty: {
                parties: [
                    {
                        partyRoleType: 'OWNER' as PartyRoles, //- lifecad party API
                        firstName: 'JAMES',
                        middleName: 'C',
                        lastName: 'FORD',
                        fullName: 'JAMES C FORD',
                        suffix: null,
                        dob: { text: null },
                        taxId: '572621420',
                        email: null,
                        employer: null,
                        maritalStatus: {
                            text: '' as maritalStatusType, //-UI
                        },
                        addresses: [
                            {
                                addressLine1: '560 calle de la sierra',
                                addressLine2: '',
                                addressLine3: null,
                                addressLine4: null,
                                addressType: 'DEFAULT' as AddressTypes,
                                city: '',
                                country: null,
                                state: 'CA',
                                zip: '92019-1241',
                                zipPlusFour: '',
                            },
                        ],
                        phones: [
                            {
                                phoneCountry: 'US',
                                phoneNumber: '6192001466',
                                phoneTypeDesc: 'Default',
                                phoneType: {
                                    text: 'Owner_Phone_Day' as PhoneTypes, //-party API phone type
                                },
                            },
                            {
                                phoneCountry: 'US',
                                phoneNumber: '6192001411',
                                phoneTypeDesc: 'Default',
                                phoneType: {
                                    text: 'Owner_Phone_Home' as PhoneTypes,
                                },
                            },
                        ],
                    },
                ],
            },
            formDistribution: {
                moneyType: {
                    text: 'Prorata' as MoneyType, //-distribution instruction fro UI //Pre Tax, After Tax, Prorata
                },
                distributionType: null, //-- set null - required for SSW
                oneYearRenewalGurantee: null, //- hard coded
                funds: [
                    {
                        amount: {
                            text: '122',
                            amountType: AmountType.Percent,
                        },
                        fundCode: '056HJ0A',
                        fundName: 'Fixed',
                    },
                    {
                        amount: {
                            text: '54',
                            amountType: AmountType.Dollar,
                        },
                        fundCode: '056HJ0B',
                        fundName: 'This is a somewhat long fund name',
                    },
                    {
                        amount: {
                            text: '25000',
                            amountType: AmountType.Dollar,
                        },
                        fundCode: '056HJ0C',
                        fundName:
                            'This is an even longer fund name, just to see what happens',
                    },
                ],
            },
            formDisbursement: {
                ChooseBankingType: '',

                paymentMethod: {
                    // ONLY USED FOR WIRE/EFT CHECK IS paymentMAIL TYPE (null otherwise)
                    text: 'Wire' as PaymentMethod, //-- UI Direct, [Wire, EFT], List Bill, List Bill/Forward  NA: null
                },
                paymentMailType: {
                    // updated UI has enums ONLY USED FOR SEND CHECK
                    text: null, //-- UI // 'CheckAOR'
                },
                bank: [
                    {
                        // ONLY EFT OR WIRE populates this information ALWAYS EMPTY non-UI FIELDS
                        accountNumber: '', //-- UI (populated via lifecad initially)
                        accountType: {
                            text: 'Checking' as AccountType, //-- ?? Hardcoded to checking
                        },
                        bankContactPerson: '',
                        bankFurtherCreditAccount: '',
                        bankFurtherCreditName: '',
                        bankInfoCompleteInd: '',
                        bankLocation: '',
                        bankName: '', //-- UI
                        bankPhone: '',
                        nameOnBankAccount: '', //-- UI
                        routingNumber: '', //-- UI
                        maskedAccountNumber: null,
                        isDirectDeposit: {
                            text: true,
                        },
                    },
                ],
                paymentToBrokerageAccount: false, //-- n/a for sbgc
                payeeType: 'OWNER', //-- hardcoded
                voidCheck: true,
                doesCheckMeetSecRequiremnt: null,
                participantId: null,
                payee: {
                    name: {
                        text: 'Payee Name',
                    },
                    contractNumber: {
                        text: '123456',
                    },
                    addresses: [
                        {
                            addressLine1: '4952 PATZER LN',
                            addressType: AddressTypes.DEFAULT,
                            city: 'ORIENT',
                            state: 'OH',
                            zip: '43146',
                        },
                    ],
                    taxId: { text: '' },
                },
                upsAccount: {
                    accountName: { text: '' },
                    accountNumber: { text: '' },
                    zip: { text: '' },
                },
                emailDeliveryNotification: { text: false },
                isDifferentPayeeOrAddress: { text: false },
                isWireApprovalPresent: { text: false },
                bankVerification: {
                    selectedBankingType: '',
                    validationsMap: {
                        VOIDED_CHECK: {
                            fraudRedFlagsCheck: null,
                            isBlankVoidedCheck: null,
                            hasHandwrittenVOID: null,
                            securityFeaturesPresent: null,
                            ownerNameMatch: null,
                            ownerAddressMatch: null,
                        },
                        BANK_LETTERHEAD: {
                            isValidBankLetterhead: null,
                            hasBankAddress: null,
                            hasBankOfficialSignature: null,
                            containsHandwrittenBankDetails: null,
                        },
                        DIRECT_DEPOSIT_FORM: {
                            noAdditionalValidationRequired: null,
                        },
                        STARTER_CHECK: {
                            noAdditionalValidationRequired: null,
                        },
                        NO_BANK_PROOF: {
                            noAdditionalValidationRequired: null,
                        },
                    },
                },
            },
            formRestriction: {
                restrictions: [
                    {
                        //-- UI
                        selectionOptions: {
                            SeveranceDate: { text: '2021-08-01' },
                        },
                        text: RestrictionOption.Severance,
                    },
                ],
                hardship: [],
                emergency: [
                    {
                        selectionOptions: {
                            DistribUnforseenDesc: {
                                text: 'Testing that this will prepopulate',
                            },
                        },
                        text: EmergencyOption.BeyondControl,
                    },
                ],
            },
            formTaxWithholding: {
                taxWithholding: [
                    {
                        place: {
                            text: 'Federal', // State
                        },
                        type: {
                            text: 'No Tax Withholding', //Minimum Tax Withholding - selectMin button
                            //Specified Tax Withholding -- user is giving value in $ or %
                            //No Tax Withholding -- Don't Withh button
                            //No Tax Withholding Allowed
                            //Take Inputted Value
                        },
                        amount: {
                            text: '0',
                            amountType: null, //-- DOLLAR/PERCENT
                        },
                        filingStatus: {
                            text: null, //-- always null
                        },
                        exemption: {
                            text: null, //-- always null
                        },
                        additionalAmount: {
                            text: null,
                            amountType: null,
                        },
                    },
                ],
            },
            formAdditionalWaivers: [
                {
                    text: PolicyWaiver.NURSING_HOME_AND_HOSPITAL,
                    selectionOptions: {
                        isValid: {
                            text: true,
                        },
                    },
                },
                {
                    text: PolicyWaiver.TERMINAL_ILLNESS,
                    selectionOptions: {
                        isValid: {
                            text: true,
                        },
                    },
                },
            ],
            formTpaAuthorization: {
                // If not 403B, will be null on backend.  Render this TPA Auth based on existence of this data in the response
                //-- TPA Role in Signature selected on UI then it come in this section
                isAuthorization: {
                    text: null,
                },
                isAgreementAttached: {
                    text: 'No',
                },
                signOf: {
                    text: null,
                },
                signature: {
                    isSigned: true, // UI
                    signDate: {
                        text: '07/10/2023', // UI
                    },
                    signExtension: null,
                    signName: null,
                    signOtherTitle: null,
                    signTitle: {
                        text: null, // UI EMPLOYER or TPA
                    },
                    signTitles: [
                        {
                            text: null,
                        },
                    ],
                    signType: {
                        text: null,
                    },
                    spousalConsent: {
                        text: null,
                    },
                },
            },
            formSurrenderingCompany: null,
            formFullSurrenderAck: {
                isFinancialProfessionAck: {
                    text: null, //-- set empty
                },
                signature: [
                    //-- Not required  set complete object as null
                ],
            },
            formTaxIdCertificate: {
                //UI will not touch anything in here
                //-- Not required  set complete object as null
                signatures: [
                    {
                        isSigned: true,
                        signDate: {
                            text: '07/10/2023',
                        },
                        signExtension: null, //{},
                        signName: null,
                        signOtherTitle: null,
                        signTitle: {
                            text: null,
                        },
                        signTitles: [
                            {
                                text: null,
                            },
                        ],
                        signType: {
                            text: 'Financial Professional',
                        },
                        spousalConsent: {
                            text: null,
                        },
                    },
                ],
            },
            formSignature: {
                isSpousalConsentRequired: null,
                signatures: [
                    // UI will get an empty array.  Business logic to populate to determine parties etc will still be UI's responsibility
                    {
                        isSigned: true,
                        signDate: {
                            text: '2023-07-10',
                        },
                        signExtension: null,
                        signName: null,
                        signOtherTitle: null,
                        signTitle: {
                            text: null,
                        },
                        signTitles: [
                            {
                                text: null,
                            },
                        ],
                        signType: {
                            text: 'Owner' as SignatureValidationTypeWithdrawal, //-- Owner/Joint Owner/Spouse/Notary/Irrevocable Beneficiary/Power of Attorney
                        },
                        spousalConsent: {
                            text: null,
                        },
                    },
                ],
            },
            formLoan: {
                isLoanAck: {
                    text: false, //-- UI true/false/"Empty?/Null?"
                },
            },
            formSpecialInstruction: {
                // BACKEND WILL POPULATE (do not touch)
                specialInstructionPresent: {
                    text: null, //--  Not required  set complete object as null
                },
                neaBenefitSensitivity: {
                    text: 'null',
                },
            },
            formIrsData: [
                {
                    irsFormType: IrsFormType.W4P,
                    irsApplicable: true, // Should be false, but this is backend's responsibility
                    irsSpecified: true, // Should be false, but this is backend's responsibility
                    formParty: {
                        partyRoleType: 'OWNER' as PartyRoles,
                        firstName: 'JAMES',
                        middleName: 'C',
                        lastName: 'FORD',
                        fullName: 'JAMES C FORD',
                        suffix: '1',
                        dob: { text: null },
                        taxId: '572621420',
                        email: null,
                        employer: null,
                        maritalStatus: {
                            text: '' as maritalStatusType, //-UI
                        },
                        addresses: [
                            {
                                addressLine1: '560 calle de la sierra',
                                addressLine2: null,
                                addressLine3: null,
                                addressLine4: null,
                                addressType: 'DEFAULT' as AddressTypes,
                                city: 'el cajon',
                                country: null,
                                state: 'CA',
                                zip: '92019-1241',
                                zipPlusFour: null,
                            },
                        ],
                        phones: [
                            {
                                phoneCountry: 'US',
                                phoneNumber: '6192001466',
                                phoneTypeDesc: 'Default',
                                phoneType: {
                                    text: 'Owner_Phone_Day' as PhoneTypes,
                                },
                            },
                        ],
                    },
                    irsTaxWithholding: [
                        {
                            place: {
                                text: 'Federal',
                            },
                            type: {
                                text: 'No Tax Withholding',
                            },
                            amount: {
                                text: '0',
                                amountType: null,
                            },
                            filingStatus: {
                                text: null,
                            },
                            exemption: {
                                text: null,
                            },
                            additionalAmount: {
                                text: null,
                                amountType: null,
                            },
                        },
                    ],
                    irsSignature: {
                        isSigned: null,
                        signDate: {
                            text: null,
                        },
                        signExtension: null,
                        signName: null,
                        signOtherTitle: null,
                        signTitle: {
                            text: null,
                        },
                        signTitles: [
                            {
                                text: null,
                            },
                        ],
                        signType: {
                            text: null,
                        },
                        spousalConsent: {
                            text: null,
                        },
                    },
                },
                {
                    irsFormType: IrsFormType.W4P,
                    irsApplicable: true,
                    irsSpecified: true,
                    formParty: {
                        partyRoleType: 'OWNER' as PartyRoles,
                        fullName: '',
                        firstName: '',
                        middleName: '',
                        lastName: '',
                        taxId: '',
                        addresses: [
                            {
                                addressLine1: '',
                                addressLine2: '',
                                addressLine3: '',
                                addressLine4: null,
                                addressType: AddressTypes.DEFAULT,
                                city: '',
                                country: null,
                                state: '',
                                zip: '',
                                zipPlusFour: '',
                                isAddressChanged: false,
                            },
                        ],
                        phones: [],
                        maritalStatus: { text: null },
                    },
                    irsSignature: undefined,
                    irsTaxWithholding: [
                        {
                            place: {
                                text: TaxWithholdingPlace.State,
                            },
                            type: {
                                text: WithholdingType.NoTaxWithholding,
                            },
                            amount: {
                                text: '10',
                                amountType: AmountType.Dollar,
                            },
                            noOfallowances: {
                                text: '10',
                            },

                            additionalAmount: {
                                text: null,
                                amountType: null,
                            },
                            filingStatus: {
                                text: null,
                            },
                            exemption: {
                                text: null,
                            },
                        },
                    ],
                },
            ],
        },
    },
};
