import { ValueFormatterParams, ValueParserParams } from 'ag-grid-community';
import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { AddressTypes, FormValidationErrors, PartyRoles } from '@deps/models/case/withdrawal/case';

import { AddressField } from '../components/address-details/address-details.type';
import { BenefitType, ContractComparisonField } from '../components/create-disclosure/create-disclosure.types';
import {
    DisclosureAuthorizationConfig,
    DisclosureAuthorizationFields,
    DisclosureAuthorizationInformation,
    Products,
} from '../components/disclosure-authorization/disclosure-authorization.types';
import { AnnuityQuote, ProposedAnnuityFormData } from '../components/proposed-annuity-quote/proposed-annuity-quote.types';
import { UserInfo } from '../components/user-information/user-information.type';
import { CurrentPage, FormParts, TypeOfPaymentOptions, UserFields } from '../reg60.types';

export function numberParser(params: ValueParserParams) {
    const result = parseFloat(params.newValue).toFixed(2);
    if (isNaN(+result) || +result <= 0) return '';
    return +result;
}

function getValidationErrors(data: any, t: TFunction) {
    const errors = [];

    for (const item of data) {
        const errorItem = {} as any;

        // Check top-level properties
        for (const key in item) {
            if (key !== 'carrierBenefits') {
                // Exclude carrierBenefits for separate check
                if (typeof item[key] === 'string' && item[key]?.trim() === '') {
                    errorItem[key] = `${t(`contractComparison.${key}`)} ${t('contractComparison.isRequired')}`;
                } else if (['surrenderValue', 'accountValue'].includes(key) && item[key] <= 0) {
                    errorItem[key] = `${t(`contractComparison.${key}`)} ${t('contractComparison.greaterThanZero')}`;
                } else if (typeof item[key] === 'object' && item[key]?.applicable && !item[key]?.amount) {
                    errorItem[key] = `${t(`contractComparison.${key}`)} is required`;
                } else if (typeof item[key] === 'number' && !item[key]) {
                    errorItem[key] = `${t(`contractComparison.${key}`)} ${t('contractComparison.isRequired')}`;
                }
            }
        }

        // Add error item to errors array if it has any errors
        if (Object.keys(errorItem).length >= 0) {
            errors.push(errorItem);
        }
    }

    return errors;
}

export function amountCellFormatter(params: ValueFormatterParams) {
    return params.value ? '$ ' + parseFloat(params.value).toFixed(2) : params.value;
}

export default function getMassMutualReg60Config(t: TFunction) {
    const ownerInformationConfig = {
        partyRoleType: PartyRoles.OWNER,
        title: t('ownerInformation.header'),
        titleTooltip: t('ownerInformation.titleTooltip'),
        userFields: {
            fields: {
                firstName: {
                    fieldName: UserFields.FirstName,
                    fieldLabel: t('partyDetails.firstName'),
                },
                middleName: {
                    fieldName: UserFields.MiddleName,
                    fieldLabel: t('partyDetails.middleName'),
                },
                lastName: {
                    fieldName: UserFields.LastName,
                    fieldLabel: t('partyDetails.lastName'),
                },
                userPhoneNumber: {
                    fieldName: UserFields.UserPhoneNumber,
                    fieldLabel: t('partyDetails.ownerPhoneNumber'),
                },
                userSSN: {
                    fieldName: UserFields.OwnerSSN,
                    fieldLabel: t('partyDetails.ownerSSN'),
                },
                extension: {
                    fieldName: UserFields.Extension,
                    fieldLabel: t('partyDetails.extension'),
                },
                phoneType: {
                    home: {
                        fieldName: UserFields.PhoneType,
                        fieldLabel: t('partyDetails.home'),
                    },
                    work: {
                        fieldName: UserFields.PhoneType,
                        fieldLabel: t('partyDetails.work'),
                    },
                    mobile: {
                        fieldName: UserFields.PhoneType,
                        fieldLabel: t('partyDetails.mobile'),
                    },
                },
            },
        },
        addressFields: {
            fields: {
                streetAddress: {
                    fieldName: AddressField.StreetAddress,
                    fieldLabel: t('partyDetails.addressDetails.streetAddress'),
                },
                streetAddress2: {
                    fieldName: AddressField.StreetAddress2,
                    fieldLabel: t('partyDetails.addressDetails.streetAddress2'),
                },
                streetAddress3: {
                    fieldName: AddressField.StreetAddress3,
                    fieldLabel: t('partyDetails.addressDetails.streetAddress3'),
                },
                city: {
                    fieldName: AddressField.City,
                    fieldLabel: t('partyDetails.addressDetails.city'),
                },
                state: {
                    fieldName: AddressField.State,
                    fieldLabel: t('partyDetails.addressDetails.state'),
                },
                zip: {
                    fieldName: AddressField.Zip,
                    fieldLabel: t('partyDetails.addressDetails.zip'),
                },
            },
        },
    };
    const agentInformtaionConfig = {
        partyRoleType: PartyRoles.AGENT,
        title: t('agentInformation.header'),
        titleTooltip: t('agentInformation.titleTooltip'),
        userFields: {
            fields: {
                firstName: {
                    fieldName: UserFields.FirstName,
                    fieldLabel: t('partyDetails.firstName'),
                },
                middleName: {
                    fieldName: UserFields.MiddleName,
                    fieldLabel: t('partyDetails.middleName'),
                },
                lastName: {
                    fieldName: UserFields.LastName,
                    fieldLabel: t('partyDetails.lastName'),
                },
                channel: {
                    fieldName: UserFields.Channel,
                    fieldLabel: t('partyDetails.channel'),
                },
                userPhoneNumber: {
                    fieldName: UserFields.UserPhoneNumber,
                    fieldLabel: t('partyDetails.agentPhoneNumber'),
                },
                userCompany: {
                    fieldName: UserFields.AgentCompany,
                    fieldLabel: t('partyDetails.agentCompany'),
                },
                extension: {
                    fieldName: UserFields.Extension,
                    fieldLabel: t('partyDetails.extension'),
                },
                phoneType: {
                    work: {
                        fieldName: UserFields.PhoneType,
                        fieldLabel: t('partyDetails.work'),
                    },
                    mobile: {
                        fieldName: UserFields.PhoneType,
                        fieldLabel: t('partyDetails.mobile'),
                    },
                },
            },
        },
        addressFields: {
            addressType: AddressTypes.AGENT_ADDRESS,
            title: '',
            fields: {
                streetAddress: {
                    fieldName: AddressField.StreetAddress,
                    fieldLabel: t('partyDetails.addressDetails.agentStreetAddress'),
                },
                streetAddress2: {
                    fieldName: AddressField.StreetAddress2,
                    fieldLabel: t('partyDetails.addressDetails.streetAddress2'),
                },
                streetAddress3: {
                    fieldName: AddressField.StreetAddress3,
                    fieldLabel: t('partyDetails.addressDetails.streetAddress3'),
                },
                city: {
                    fieldName: AddressField.City,
                    fieldLabel: t('partyDetails.addressDetails.city'),
                },
                state: {
                    fieldName: AddressField.State,
                    fieldLabel: t('partyDetails.addressDetails.state'),
                },
                zip: {
                    fieldName: AddressField.Zip,
                    fieldLabel: t('partyDetails.addressDetails.zip'),
                },
            },
        },
    };

    const disclosureAuthorizationConfig: DisclosureAuthorizationConfig = {
        title: t('disclosureAuthorization.title'),
        fields: [
            {
                fieldName: DisclosureAuthorizationFields.SignatureDate,
                fieldLabel: t('disclosureAuthorization.signatureDate'),
            },
            {
                fieldName: DisclosureAuthorizationFields.ExpectedAcctValue,
                fieldLabel: t('disclosureAuthorization.expectedAcctValue'),
            },
            {
                fieldName: DisclosureAuthorizationFields.Product,
                fieldLabel: t('disclosureAuthorization.product'),
            },
            {
                fieldName: DisclosureAuthorizationFields.CdscPeriod,
                fieldLabel: t('disclosureAuthorization.cdscPeriod'),
            },
        ],
    };

    const comparisonFieldsNew = {
        comparisonType: {
            fieldName: ContractComparisonField.comparisonType,
            fieldLabel: t('contractComparison.comparisonType'),
        },
        partialRequest: {
            fieldName: ContractComparisonField.partialRequest,
            fieldLabel: t('contractComparison.partialRequest'),
        },
        goodFaithEstimateRequired: {
            fieldName: ContractComparisonField.goodFaithEstimateRequired,
            fieldLabel: t('contractComparison.goodFaithEstimateRequired'),
        },
        companyName: {
            fieldName: ContractComparisonField.companyName,
            fieldLabel: t('contractComparison.companyName'),
        },
        companyPhoneNumber: {
            fieldName: ContractComparisonField.companyPhoneNumber,
            fieldLabel: t('contractComparison.companyPhoneNumber'),
        },
        contractNumber: {
            fieldName: ContractComparisonField.contractNumber,
            fieldLabel: t('contractComparison.contractNumber'),
        },
        issueDate: {
            fieldName: ContractComparisonField.issueDate,
            fieldLabel: t('contractComparison.issueDate'),
        },
        accountValue: {
            fieldName: ContractComparisonField.accountValue,
            fieldLabel: t('contractComparison.accountValue'),
        },
        surrenderChargeApplies: {
            fieldName: ContractComparisonField.surrenderChargeApplies,
            fieldLabel: t('contractComparison.surrenderChargeApplies'),
        },
        mvaApplies: {
            fieldName: ContractComparisonField.mvaApplies,
            fieldLabel: t('contractComparison.mvaApplies'),
        },
        surrenderValue: {
            fieldName: ContractComparisonField.surrenderValue,
            fieldLabel: t('contractComparison.surrenderValue'),
        },
        annuitizationValueReceived: {
            fieldName: ContractComparisonField.annuitizationValueReceived,
            fieldLabel: t('contractComparison.annuitizationValueReceived'),
        },
    };

    const comparisonTable = [
        {
            title: t('contractComparison.table.surrenderValueTable.title'),
            key: BenefitType.SurrenderBenefit,
            rowConfig: [
                {
                    period: t('contractComparison.table.surrenderValueTable.rowPeriods.fiveYears'),
                    returnGuarRate: '',
                    returnCurrRate: '',
                    return0Prct: '',
                    return6Prct: '',
                    return12Prct: '',
                },
                {
                    period: t('contractComparison.table.surrenderValueTable.rowPeriods.tenYears'),
                    returnGuarRate: '',
                    returnCurrRate: '',
                    return0Prct: '',
                    return6Prct: '',
                    return12Prct: '',
                },
            ],
            colConfigFixed: [
                {
                    headerName: t('contractComparison.table.surrenderValueTable.fixedCol.years'),
                    field: 'period',
                    editable: false,
                    cellClass: ['w-100', 'text-sm'],
                },
                {
                    headerName: t('contractComparison.table.surrenderValueTable.fixedCol.guaranteedRate'),
                    field: 'returnGuarRate',
                    editable: true,
                    cellClass: ['w-100', 'text-sm'],
                    valueParser: numberParser,
                    valueFormatter: amountCellFormatter,
                },
                {
                    headerName: t('contractComparison.table.surrenderValueTable.fixedCol.currentRate'),
                    field: 'returnCurrRate',
                    editable: true,
                    cellClass: ['w-100', 'text-sm'],
                    valueParser: numberParser,
                    valueFormatter: amountCellFormatter,
                },
            ],
            colConfigVariable: [
                {
                    headerName: t('contractComparison.table.surrenderValueTable.variableCol.year'),
                    field: 'period',
                    editable: false,
                    cellClass: ['w-100', 'text-sm border-b-xl'],
                },
                {
                    headerName: t('contractComparison.table.surrenderValueTable.variableCol.zeroPercent'),
                    field: 'return0Prct',
                    editable: true,
                    cellClass: ['w-100', 'text-sm'],
                    valueParser: numberParser,
                    valueFormatter: amountCellFormatter,
                },
                {
                    headerName: t('contractComparison.table.surrenderValueTable.variableCol.sixPercent'),
                    field: 'return6Prct',
                    editable: true,
                    cellClass: ['w-100', 'text-sm'],
                    valueParser: numberParser,
                    valueFormatter: amountCellFormatter,
                },
                {
                    headerName: t('contractComparison.table.surrenderValueTable.variableCol.twelvePercent'),
                    field: 'return12Prct',
                    editable: true,
                    cellClass: ['w-100', 'text-sm'],
                    valueParser: numberParser,
                    valueFormatter: amountCellFormatter,
                },
            ],
        },
        {
            title: t('contractComparison.table.deathBenefitsTable.title'),
            key: BenefitType.DeathBenefit,
            rowConfig: [
                {
                    period: t('contractComparison.table.deathBenefitsTable.rowPeriods.fiveYears'),
                    returnGuarRate: '',
                    returnCurrRate: '',
                    return0Prct: '',
                    return6Prct: '',
                    return12Prct: '',
                },
                {
                    period: t('contractComparison.table.deathBenefitsTable.rowPeriods.tenYears'),
                    returnGuarRate: '',
                    returnCurrRate: '',
                    return0Prct: '',
                    return6Prct: '',
                    return12Prct: '',
                },
            ],
            colConfigFixed: [
                {
                    headerName: t('contractComparison.table.deathBenefitsTable.fixedCol.years'),
                    field: 'period',
                    editable: false,
                    cellClass: ['w-100', 'text-sm'],
                },
                {
                    headerName: t('contractComparison.table.deathBenefitsTable.fixedCol.guaranteedRate'),
                    field: 'returnGuarRate',
                    editable: true,
                    cellClass: ['w-100', 'text-sm'],
                    valueParser: numberParser,
                    valueFormatter: amountCellFormatter,
                },
                {
                    headerName: t('contractComparison.table.deathBenefitsTable.fixedCol.currentRate'),
                    field: 'returnCurrRate',
                    editable: true,
                    cellClass: ['w-100', 'text-sm'],
                    valueParser: numberParser,
                    valueFormatter: amountCellFormatter,
                },
            ],
            colConfigVariable: [
                {
                    headerName: t('contractComparison.table.deathBenefitsTable.variableCol.year'),
                    field: 'period',
                    editable: false,
                    cellClass: ['w-100', 'text-sm border-b-xl'],
                },
                {
                    headerName: t('contractComparison.table.deathBenefitsTable.variableCol.zeroPercent'),
                    field: 'return0Prct',
                    editable: true,
                    cellClass: ['w-100', 'text-sm'],
                    valueParser: numberParser,
                    valueFormatter: amountCellFormatter,
                },
                {
                    headerName: t('contractComparison.table.deathBenefitsTable.variableCol.sixPercent'),
                    field: 'return6Prct',
                    editable: true,
                    cellClass: ['w-100', 'text-sm'],
                    valueParser: numberParser,
                    valueFormatter: amountCellFormatter,
                },
                {
                    headerName: t('contractComparison.table.deathBenefitsTable.variableCol.twelvePercent'),
                    field: 'return12Prct',
                    editable: true,
                    cellClass: ['w-100', 'text-sm'],
                    valueParser: numberParser,
                    valueFormatter: amountCellFormatter,
                },
            ],
        },
    ];

    const disclosureConfig = {
        title: t('contractComparison.comparisonContract'),
        field: comparisonFieldsNew,
        table: comparisonTable,
    };

    const proposedAnnuityQuoteConfig = {
        fields: {
            proposedAnnuityQuote: {
                title: t('proposedAnnuityQuote.proposedAnnuityQuoteTitle'),
            },
            annuityPaymentAmount: {
                fieldName: ProposedAnnuityFormData.AnnuityPaymentAmount,
                fieldLabel: t('proposedAnnuityQuote.annuityPaymentAmount'),
                isRequired: true,
            },
            firstPaymentDate: {
                fieldName: ProposedAnnuityFormData.FirstPaymentDate,
                fieldLabel: t('proposedAnnuityQuote.firstPaymentDate'),
                isRequired: true,
            },
            paymentFrequency: {
                fieldName: ProposedAnnuityFormData.PaymentFrequency,
                fieldLabel: t('proposedAnnuityQuote.paymentFrequencyLabel'),
                isRequired: true,
            },
            incomeOption: {
                fieldName: ProposedAnnuityFormData.IncomeOption,
                fieldLabel: t('proposedAnnuityQuote.incomeOptionLabel'),
                isRequired: true,
            },
            periodCertainYears: {
                fieldName: ProposedAnnuityFormData.PeriodCertainYears,
                fieldLabel: t('proposedAnnuityQuote.periodCertainYears'),
                isRequired: true,
            },
        },
    };

    const annuitizationQuoteConfig = {
        fields: {
            annuitizationQuote: {
                title: t('proposedAnnuityQuote.annuitizationQuoteTitle'),
            },
            annuityPaymentAmount: {
                fieldName: ProposedAnnuityFormData.AnnuityPaymentAmount,
                fieldLabel: t('proposedAnnuityQuote.annuityPaymentAmount'),
                isRequired: false,
            },
            firstPaymentDate: {
                fieldName: ProposedAnnuityFormData.FirstPaymentDate,
                fieldLabel: t('proposedAnnuityQuote.firstPaymentDate'),
                isRequired: false,
            },
            paymentFrequencyText: {
                fieldName: ProposedAnnuityFormData.PaymentFrequency,
                fieldLabel: t('proposedAnnuityQuote.paymentFrequencyLabel'),
                isRequired: false,
            },
            incomeOptionText: {
                fieldName: ProposedAnnuityFormData.IncomeOption,
                fieldLabel: t('proposedAnnuityQuote.incomeOptionLabel'),
                isRequired: false,
            },
            typeOfPayment: {
                fieldLabel: t('proposedAnnuityQuote.typeOfPayment'),
                isRequired: false,
                selectOptions: [
                    { label: t('proposedAnnuityQuote.typeOfPaymentOptions.fixed'), value: TypeOfPaymentOptions.Fixed },
                    { label: t('proposedAnnuityQuote.typeOfPaymentOptions.variable'), value: TypeOfPaymentOptions.Variable },
                ],
            },
        },
    };

    const validateDisclosureAuthorizationForm = (disclosureAuthorization: DisclosureAuthorizationInformation) => {
        const errors = {} as FormValidationErrors;
        if (!disclosureAuthorization?.signatureDate) {
            errors[`signatureDate`] = t('formErrors.formValidation.signatureDateIsRequired');
        }
        if (disclosureAuthorization?.signatureDate) {
            const selectedDate = disclosureAuthorization?.signatureDate || '';
            if (dayjs().diff(selectedDate, 'days') > 120) {
                errors['signatureDate'] = t('formErrors.formValidation.signatureDateIsInvalid');
            }
        }
        if (
            !disclosureAuthorization?.expectedAcctValue ||
            (disclosureAuthorization?.expectedAcctValue && Number(disclosureAuthorization?.expectedAcctValue) <= 0)
        ) {
            errors[`expectedAcctValue`] = t('formErrors.formValidation.expectedAcctValueIsRequired');
        }
        if (!disclosureAuthorization?.product) {
            errors[`product`] = t('formErrors.formValidation.productIsRequired');
        }
        if (disclosureAuthorization?.product === Products.stableVoyage && !disclosureAuthorization?.cdscPeriod) {
            errors[`cdscPeriod`] = t('formErrors.formValidation.cdscPeriodIsRequired');
        }
        return errors;
    };

    const validateProposedAnnuitizationQuote = (proposedAnnuityQuote: AnnuityQuote) => {
        const errors = {} as FormValidationErrors;
        if (!proposedAnnuityQuote.annuityPaymentAmount) {
            errors['annuityPaymentAmount'] = t('formErrors.formValidation.annuityPaymentAmountIsRequired');
        }
        if (!proposedAnnuityQuote.firstPaymentDate) {
            errors['firstPaymentDate'] = t('formErrors.formValidation.firstPaymentDateIsRequired');
        }
        if (!proposedAnnuityQuote.incomeOption) {
            errors['incomeOption'] = t('formErrors.formValidation.incomeOptionIsRequired');
        }
        if (!proposedAnnuityQuote.paymentFrequency) {
            errors['paymentFrequency'] = t('formErrors.formValidation.paymentFrequencyIsRequired');
        }
        if (
            proposedAnnuityQuote.incomeOption === 'SINGLE_LIFE_PC' ||
            proposedAnnuityQuote.incomeOption === 'JT_SURV_LIFE_PC' ||
            proposedAnnuityQuote.incomeOption === 'PERIOD_CERTAIN' ||
            proposedAnnuityQuote.incomeOption === 'JT_SURV_CONV_PC'
        ) {
            if (!proposedAnnuityQuote.periodCertainYears) {
                errors['periodCertainYears'] = t('formErrors.formValidation.periodCertainYearsIsRequired');
            }
        }

        return errors;
    };

    const formValidation = ({
        ownerInformation,
        agentInformation,
        disclosureAuthorization,
        disclosure,
        currentPage,
        document,
    }: Partial<FormParts> = {}): FormValidationErrors => {
        const errors: FormValidationErrors = {};

        const validateParty = (party: UserInfo, role: PartyRoles) => {
            const partyErrors: Partial<FormValidationErrors> = {};
            const address = party.addressDetails || {};

            if (role === PartyRoles.OWNER && !party.personalInformation.firstName && !document?.firstName) {
                partyErrors[`${role}_firstName`] = t('formErrors.formValidation.firstNameIsRequired') || '';
            }

            if (role === PartyRoles.AGENT && !party.personalInformation.firstName && !document?.agentFirstName) {
                partyErrors[`${role}_firstName`] = t('formErrors.formValidation.firstNameIsRequired') || '';
            }

            // if (!party.personalInformation.middleName) {
            //     partyErrors[`${role}_middleName`] = t('formErrors.formValidation.middleNameIsRequired') || '';
            // }

            if (role === PartyRoles.OWNER && !party.personalInformation.lastName && !document?.lastName) {
                partyErrors[`${role}_lastName`] = t('formErrors.formValidation.lastNameIsRequired') || '';
            }

            if (role === PartyRoles.AGENT && !party.personalInformation.lastName && !document?.agentLastName) {
                partyErrors[`${role}_firstName`] = t('formErrors.formValidation.firstNameIsRequired') || '';
            }
            if (!party.companyName && role === PartyRoles.AGENT && !document?.bdName) {
                partyErrors[`${role}_companyName`] = t('formErrors.formValidation.companyNameIsRequired') || '';
            }
            if (!party.personalInformation.ssNumber && role === PartyRoles.OWNER && !document?.ssNTaxId) {
                partyErrors[`${role}_ssNumber`] = t('formErrors.formValidation.ownerSSNisRequired') || '';
            }

            if (!address.addressLine1) {
                partyErrors[`${role}_addressLine1`] = t('formErrors.formValidation.ownerStreetAddressIsRequired') || '';
            }

            if (!address.city) {
                partyErrors[`${role}_city`] = t('formErrors.formValidation.cityIsRequired') || '';
            }
            if (!address.state) {
                partyErrors[`${role}_state`] = t('formErrors.formValidation.stateIsRequired') || '';
            }

            if (!address.zipCode) {
                partyErrors[`${role}_zipCode`] = t('formErrors.formValidation.zipIsRequired') || '';
            }

            return partyErrors;
        };

        if (ownerInformation) {
            Object.assign(errors, validateParty(ownerInformation, PartyRoles.OWNER));
        }

        if (agentInformation) {
            Object.assign(errors, validateParty(agentInformation, PartyRoles.AGENT));

            if (!agentInformation.channel) {
                errors[`${PartyRoles.AGENT}_channel`] = t('formErrors.formValidation.channelIsRequired');
            }
        }

        const formDisclosureAuthorization = disclosureAuthorization;
        if (formDisclosureAuthorization) {
            const disclosureAuthorizationErrors = validateDisclosureAuthorizationForm(formDisclosureAuthorization);
            Object.assign(errors, disclosureAuthorizationErrors);
        }

        if (
            Array.isArray(disclosure?.contractComparison) &&
            disclosure?.contractComparison?.length > 0 &&
            currentPage === CurrentPage.COMPARISON
        ) {
            const contractComparisonsErrors = getValidationErrors(disclosure?.contractComparison, t);
            Object.assign(errors, contractComparisonsErrors);
        }
        const annuityQuote = disclosure?.proposedAnnuitizationQuote;
        if (
            formDisclosureAuthorization?.product === Products.retireEase ||
            formDisclosureAuthorization?.product === Products.retireEaseChoice
        ) {
            if (annuityQuote && currentPage === CurrentPage.COMPARISON) {
                const annuityQuoteErrors = validateProposedAnnuitizationQuote(annuityQuote);
                Object.assign(errors, annuityQuoteErrors);
            }
        }
        return errors;
    };
    return {
        disclosureAuthorizationConfig,
        ownerInformationConfig,
        agentInformtaionConfig,
        formValidation,
        disclosureConfig,
        proposedAnnuityQuoteConfig,
        annuitizationQuoteConfig,
    };
}
