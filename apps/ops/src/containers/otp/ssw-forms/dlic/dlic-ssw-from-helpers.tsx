import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { DEFAULT_ADDRESS } from '@deps/components/otp-withdrawal-form/address-entry';
import { DisbursementToggleType } from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import {
    BankingFields,
    DisbursementFields,
    getDefaultFormDisbursementValues,
    shouldDisplayAddress,
    shouldDisplayPayeeName,
    updateBankingDetails,
} from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers';
import { BankingDetails } from '@deps/components/otp-withdrawal-form/form-disbursement-V2/form-disbursement.types';
import { PartyConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import { PartyFields } from '@deps/components/otp-withdrawal-form/form-party/party-helpers';
import { PhoneFields } from '@deps/components/otp-withdrawal-form/form-party/party-phone';
import { SignatureFields } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { SignatureValidationConfig } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import { getDefaultSSWFormProgramValues } from '@deps/components/otp-withdrawal-form/ssw-program/ssw-form-program.helpers';
import { SSWProgramOptions } from '@deps/components/otp-withdrawal-form/ssw-program/ssw-program';
import { SSWProgram } from '@deps/components/otp-withdrawal-form/ssw-program/ssw-row';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { getStateCode } from '@deps/helpers/states.helpers';
import { SswUpdateOption } from '@deps/models/case/enums';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    AccountType,
    Address,
    AddressTypes,
    AmountType,
    FormDisbursement,
    FormParts,
    FormParty,
    FormValidationErrors,
    Frequency,
    FundWithdrawnMethod,
    PartyRoles,
    PaymentMailType,
    PaymentMethod,
    PhoneTypes,
    SSWType,
    TaxWithholdingPlace,
} from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_BANK_DETAILS,
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementParts,
    FormDisbursementSelections,
    SendCheckOption,
} from '@deps/models/case/withdrawal/disbursement-types';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import {
    Address as SorAddress,
    Party,
    PolicyPartyRoles,
} from '@zinnia/api-types/types/sor';

import { createValidator } from '../../utils/helper-utils';
import { validateSignESign } from '../../withdrawal-forms/utils/form-validator.helpers';

export default function getDlicConfig(
    t: TFunction,
    isDlic3pDisbursementChangesEnabled: boolean,
    isLC: boolean = true
) {
    const formValidation = ({
        formSignature,
        formProgram,
        formDistribution,
        formESignatureData,
    }: Partial<FormParts> = {}): FormValidationErrors => {
        const errors = {} as FormValidationErrors;
        const sswProgramStartDate =
            formProgram?.programFrequency?.beginDate?.text || null;
        const sswType = formProgram?.programSubType?.text || '';
        const funds = formDistribution?.funds?.filter(
            (fund) => !!fund.amount.text
        );

        if (
            isLC &&
            sswProgramStartDate &&
            [29, 30, 31].includes(
                dayjs(sswProgramStartDate, ZAHARA_API_DATE_FORMAT).get('D')
            )
        ) {
            errors['systematicStartDate'] = t(
                'sswProgram.warnings.systematicStartDate',
                { startDate: 1, endDate: 28 }
            );
        }

        if (
            isLC &&
            sswType === SSWType.PercentOfAmountValue &&
            funds?.length === 0
        ) {
            errors['specifyFundsRequired'] = t(
                'sswProgram.warnings.specifyFundsRequired'
            );
        }
        const signESignValidate = validateSignESign({
            formSignature,
            formESignatureData,
            t,
            validateDesignationPresent: false,
        });

        return { ...errors, ...signESignValidate };
    };

    const formPartyConfigs: PartyConfig[] = [
        {
            partyRoleType: PartyRoles.OWNER,
            title: t('personalDetails.title'),
            fields: [
                {
                    fieldName: PartyFields.FirstName,
                    fieldLabel: t('personalDetails.firstName'),
                },
                {
                    fieldName: PartyFields.MiddleName,
                    fieldLabel: t('personalDetails.middleName'),
                },
                {
                    fieldName: PartyFields.LastName,
                    fieldLabel: t('personalDetails.lastName'),
                },

                {
                    fieldName: PartyFields.TaxId,
                    fieldLabel: t('personalDetails.ssn'),
                },
            ],
            phones: [
                {
                    phoneType: PhoneTypes.Owner_Phone_Day,
                    fields: [
                        {
                            fieldName: PhoneFields.phoneNumber,
                            fieldLabel: t('phoneDetails.daytimePhone'),
                        },
                    ],
                },
                {
                    phoneType: PhoneTypes.Owner_Phone_Home,
                    fields: [
                        {
                            fieldName: PhoneFields.phoneNumber,
                            fieldLabel: t('phoneDetails.homePhone'),
                        },
                    ],
                },
            ],
            addressFields: [
                {
                    addressType: AddressTypes.DEFAULT,
                    title: t('addressDetails.title'),
                    isReadonly: true,
                },
            ],
            isAddressChanged: {
                addressType: AddressTypes.DEFAULT,
                title: t('addressDetails.checkHereIfYourAddressHasChanged'),
            },
        },
        {
            partyRoleType: PartyRoles.JOINT_OWNER,
            title: t('jointOwner.title'),
            fields: [
                {
                    fieldName: PartyFields.FirstName,
                    fieldLabel: t('personalDetails.firstName'),
                },
                {
                    fieldName: PartyFields.MiddleName,
                    fieldLabel: t('personalDetails.middleName'),
                },
                {
                    fieldName: PartyFields.LastName,
                    fieldLabel: t('personalDetails.lastName'),
                },
                {
                    fieldName: PartyFields.TaxId,
                    fieldLabel: t('personalDetails.ssn'),
                },
            ],
        },
    ];

    const generateSSWPayload = (val: SSWProgram, subType: SSWType) => ({
        ...getDefaultSSWFormProgramValues(),
        programSubType: {
            text: subType,
        },
        programFrequency: {
            frequency:
                val.frequency.text === Frequency.None
                    ? { text: '' as Frequency }
                    : val.frequency,
            beginDate: val.startDate,
            fixedPeriodYear: [
                SSWType.FixPeriod,
                SSWType.FixDollar,
                SSWType.AnnualFree,
                SSWType.PercentOfAmountValue,
                SSWType.InterestEarningDividendsGains,
            ].includes(subType)
                ? { text: null }
                : { text: val.duration.text },
            duration: val.duration,
        },
        ...(subType === SSWType.FixDollar && {
            programAmount: {
                text: val.amount?.text,
                amountType: AmountType.Dollar,
            },
        }),
        ...(subType === SSWType.PercentOfAmountValue && {
            partialPercent: {
                text: val.percent?.text,
                amountType: AmountType.Percent,
            },
        }),
    });

    const planCodes = ['674', '722'];

    const systematicWithdrawalOptions = (planCode: string, isLC: boolean) =>
        [
            {
                label: t('sswProgram.sswOptions.fixedDollar'),
                value: SSWType.FixDollar,
                generateSSWPayloadFromSelection: (val: SSWProgram) =>
                    generateSSWPayload(val, SSWType.FixDollar),
            },
            isLC && {
                label: t('sswProgram.sswOptions.jointLifetimeIncomeOption'),
                value: SSWType.JointLifetimeIncomeOption,
                generateSSWPayloadFromSelection: (val: SSWProgram) =>
                    generateSSWPayload(val, SSWType.JointLifetimeIncomeOption),
            },
            isLC && {
                label: t('sswProgram.sswOptions.singleLifetimeIncomeOption'),
                value: SSWType.SingleLifetimeIncomeOption,
                generateSSWPayloadFromSelection: (val: SSWProgram) =>
                    generateSSWPayload(val, SSWType.SingleLifetimeIncomeOption),
            },
            isLC &&
                planCodes.includes(planCode) && {
                    label: t('sswProgram.sswOptions.interestEarned'),
                    value: SSWType.InterestEarningDividendsGains,
                    generateSSWPayloadFromSelection: (val: SSWProgram) =>
                        generateSSWPayload(
                            val,
                            SSWType.InterestEarningDividendsGains
                        ),
                },
            !isLC && {
                label: t('sswProgram.sswOptions.percentageOfAccountValue'),
                value: SSWType.PercentOfAmountValue,
                generateSSWPayloadFromSelection: (val: SSWProgram) =>
                    generateSSWPayload(val, SSWType.PercentOfAmountValue),
            },
        ].filter(Boolean) as SSWProgramOptions[];

    const fundWithdrawnMethodOptions = (sswType: string, isLC: boolean) => [
        {
            label: t(`distributionInstruction.prorata`),
            value: FundWithdrawnMethod.Prorata,
            disabled: isLC && sswType === SSWType.PercentOfAmountValue,
        },
        {
            label: t(`distributionInstruction.specifyFunds`),
            value: FundWithdrawnMethod.SpecifyFunds,
        },
    ];

    const w4pSignaturesConfig = [
        {
            component: SignatureFields.SignatureType,
            key: 'w4p-owner-type',
        },
        {
            component: SignatureFields.SignaturePresent,
            key: 'w4p-signature-sign-present',
        },
        {
            component: SignatureFields.SignatureDate,
            key: 'w4p-signature-sign-date',
        },
    ];

    const disbursementOptionsV2 = [
        {
            label: t('distributionMethod.eft'),
            value: FormDisbursementSelections.EFT,
            fields: [
                {
                    fieldLabel: t('distributionMethod.chooseTheBank'),
                    fieldName: BankingFields.Bank,
                    fieldType: 'choose-the-bank',
                },
                {
                    fieldName: BankingFields.ChooseBankingType,
                    fieldLabel: t('distributionMethod.chooseTheBank'),
                    fieldType: 'choose-the-banking-type',
                    classNames: 'col-start-1 col-span-2 mt-2',
                },
                {
                    fieldName: BankingFields.AccountType,
                    fieldLabel: t('distributionMethod.accountType'),
                    fieldType: 'account-type',
                    classNames: 'col-start-1 col-span-2 mt-2',
                    isBankingField: true,
                },
                {
                    fieldName: BankingFields.AccountNumber,
                    fieldLabel: t('distributionMethod.accountNumber'),
                    fieldType: 'text',
                    classNames: 'col-start-1',
                    isBankingField: true,
                    maskOnBlur: true,
                    disableCopyPaste: true,
                },
                {
                    fieldName: BankingFields.ReEnterAccountNumber,
                    fieldLabel: t('distributionMethod.reEnterAccountNumber'),
                    fieldType: 'text',
                    classNames: 'col-start-2',
                    isBankingField: true,
                    disableCopyPaste: true,
                    validator: createValidator(
                        'accountNumber',
                        t('formValidation.accountNumberDoesNotMatch')
                    ),
                },
                {
                    fieldName: 'routingNumber',
                    fieldLabel: t('distributionMethod.bankRoutingNumber'),
                    fieldType: 'text',
                    isBankingField: true,
                    classNames: 'col-start-1',
                    maskOnBlur: true,
                    disableCopyPaste: true,
                },
                {
                    fieldName: BankingFields.ReEnterBankRoutingNumber,
                    fieldLabel: t(
                        'distributionMethod.reEnterBankRoutingNumber'
                    ),
                    fieldType: 'text',
                    isBankingField: true,
                    disableCopyPaste: true,
                    validator: createValidator(
                        'routingNumber' as any,
                        t('formValidation.routingNumberDoesNotMatch')
                    ),
                },
                {
                    fieldName: BankingFields.BankName,
                    fieldLabel: t('distributionMethod.bankName'),
                    fieldType: 'text',
                    isBankingField: true,
                    classNames: 'col-start-1 w-full',
                },
            ],
            generatePayloadFromSelection: (
                defaultDisbursementInfo: any,
                bankingInFile?: BankingDetails[] | null | []
            ) => {
                let bank = [];
                if (bankingInFile && bankingInFile?.length > 0) {
                    bank = updateBankingDetails(
                        bankingInFile[0],
                        defaultDisbursementInfo
                    );
                } else {
                    bank = defaultDisbursementInfo?.bank?.[0];
                }

                return {
                    ...getDefaultFormDisbursementValues(),
                    paymentMethod: { text: PaymentMethod.EFT },
                    paymentMailType: { text: null },
                    bank: [
                        {
                            ...DEFAULT_BANK_DETAILS,
                            accountNumber: bank?.accountNumber ?? '',
                            accountType: {
                                text: bank?.accountType?.text,
                            },
                            bankName: bank?.bankName ?? '',
                            routingNumber: bank?.bankRoutingNumber ?? '',
                            reEnterAccountNumber: bank?.reEnterAccountNumber,
                            reEnterBankRoutingNumber:
                                bank?.reEnterBankRoutingNumber,
                        },
                    ],
                    bankVerification: defaultDisbursementInfo?.bankVerification,
                };
            },
        },
        {
            label: t('distributionMethod.sendCheck'),
            value: FormDisbursementSelections.Check,
            fields: [
                {
                    fieldName: BankingFields.SelectIfPayeeIsDifferent,
                    fieldLabel: t('distributionMethod.selectIfDifferentPayee'),
                    classNames: 'col-start-1 col-span-3',
                    fieldType: 'checkbox',
                },
                {
                    fieldName: BankingFields.PayeeName,
                    fieldLabel: t('distributionMethod.payeeName'),
                    classNames: 'col-start-1 col-span-2 max-w-lg',
                    fieldType: 'text',
                },
                {
                    fieldName: BankingFields.Address,
                    classNames: 'col-span-3',
                    fieldType: 'address',
                    isAddressLine2Required: true,
                },
            ],
            generatePayloadFromSelection: ({
                payeeName,
                address,
                selectIfPayeeIsDifferent,
            }: DisbursementParts) => {
                return {
                    ...getDefaultFormDisbursementValues(),
                    paymentMethod: { text: PaymentMailType.Check },
                    paymentMailType: { text: null },
                    isDifferentPayeeOrAddress: {
                        text: selectIfPayeeIsDifferent || false,
                    },
                    payee: {
                        name: { text: payeeName || null },
                        addresses: [address || DEFAULT_ADDRESS],
                        contractNumber: { text: null },
                    },
                };
            },
        },
    ];

    const sendCheckOptions = [
        {
            label: t('distributionMethod.disburseToOwnerAddress'),
            value: SendCheckOption.OwnerAddress,
        },
        {
            label: t('distributionMethod.disburseToFinancialInstitution'),
            value: SendCheckOption.FinancialInstitution,
        },
        {
            label: t('distributionMethod.disburseToAnnuitantDlic'),
            value: SendCheckOption.Annuitant,
        },
        {
            label: t('distributionMethod.disburseToDifferentAddress'),
            value: SendCheckOption.DifferentAddress,
        },
        {
            label: t(
                'distributionMethod.disburseToThirdPartyNotCharityNotFinancial'
            ),
            value: SendCheckOption.ThirdPartyNotFinancialIns,
        },
    ];

    const disbursementOptions = (
        formParty: FormParty,
        isLC: boolean,
        parties: LifeCadParty[] | Party[],
        partyRoles: PolicyPartyRoles[]
    ) => {
        let annuitantAddress = formParty?.parties?.find(
            (party) => party.partyRoleType === PartyRoles.ANNUITANT
        )?.addresses?.[0];

        if (!annuitantAddress && !isLC) {
            const annuitantPartyId = partyRoles.find(
                (role) => String(role.partyRole) === PartyRoles.ANNUITANT
            )?.partyId;
            const annuitantParty = parties.find(
                (party) => party.partyId === annuitantPartyId
            ) as { addresses?: SorAddress[] } | undefined;
            const preferredAddressFromParty: SorAddress | undefined =
                annuitantParty?.addresses?.filter(
                    (address: SorAddress) =>
                        (address as SorAddress & { preferredAddress?: boolean })
                            .preferredAddress
                )[0];

            if (preferredAddressFromParty) {
                const addressWithLine4 =
                    preferredAddressFromParty as SorAddress & {
                        addressLine4?: string | null;
                    };
                annuitantAddress = {
                    addressLine1: preferredAddressFromParty.addressLine1 ?? '',
                    addressLine2:
                        preferredAddressFromParty.addressLine2 ?? null,
                    addressLine3:
                        preferredAddressFromParty.addressLine3 ?? null,
                    addressLine4: addressWithLine4.addressLine4 ?? null,
                    addressType:
                        (preferredAddressFromParty.addressType as
                            | AddressTypes
                            | undefined) ?? AddressTypes.DEFAULT,
                    city: preferredAddressFromParty.city ?? null,
                    country: preferredAddressFromParty.country ?? null,
                    state: getStateCode(
                        String(preferredAddressFromParty.state ?? '')
                    ),
                    zip: preferredAddressFromParty.zipCode ?? '',
                    zipPlusFour:
                        preferredAddressFromParty.zipCodeExtension ?? null,
                } satisfies Address;
            }
        }

        return [
            {
                label: t('distributionMethod.eft'),
                value: FormDisbursementSelections.EFT,
                additionalOptions: {
                    disbursementToggleType:
                        DisbursementToggleType.MaskedInfoToggle,
                },
                fields: [
                    {
                        fieldName: BankingFields.isAnnuitant,
                        fieldLabel: t(
                            'distributionMethod.disburseToAnnuitantDlic'
                        ),
                        component: DisbursementFields.BankCheckboxField,
                        classNames:
                            'col-start-1 col-span-3 flex flex-wrap gap-8 max-md:flex-col',
                        shouldDisplay: () =>
                            !!isDlic3pDisbursementChangesEnabled,
                    },
                    {
                        fieldName: BankingFields.Bank,
                        fieldLabel: t('distributionMethod.chooseTheBank'),
                        component: DisbursementFields.SelectBank,
                    },
                    {
                        fieldName: BankingFields.IsDirectDepositValid,
                        fieldLabel: t(
                            'distributionMethod.isDirectDepositFormValid'
                        ),
                        classNames: 'col-start-1',
                        component: DisbursementFields.BankBooleanButtonGroup,
                    },
                    {
                        fieldName: BankingFields.AccountType,
                        fieldLabel: t('distributionMethod.accountType'),
                        component: DisbursementFields.AccountTypes,
                        classNames: 'col-start-1 col-span-2 w-full',
                        isBankingField: true,
                    },
                    {
                        fieldName: BankingFields.AccountNumber,
                        fieldLabel: t('distributionMethod.accountNumber'),
                        component: DisbursementFields.BankTextField,
                        classNames: 'col-start-1',
                        isBankingField: true,
                        maskOnBlur: true,
                        disableCopyPaste: true,
                    },
                    {
                        fieldName: BankingFields.ReEnterAccountNumber,
                        fieldLabel: t(
                            'distributionMethod.reEnterAccountNumber'
                        ),
                        component: DisbursementFields.BankTextField,
                        classNames: 'col-start-2',
                        isBankingField: true,
                        disableCopyPaste: true,
                        validator: createValidator(
                            'accountNumber',
                            t('formValidation.accountNumberDoesNotMatch')
                        ),
                    },
                    {
                        fieldName: BankingFields.BankRoutingNumber,
                        fieldLabel: t('distributionMethod.bankRoutingNumber'),
                        component: DisbursementFields.BankTextField,
                        classNames: 'col-start-1',
                        isBankingField: true,
                        maskOnBlur: true,
                        disableCopyPaste: true,
                    },
                    {
                        fieldName: BankingFields.ReEnterBankRoutingNumber,
                        fieldLabel: t(
                            'distributionMethod.reEnterBankRoutingNumber'
                        ),
                        component: DisbursementFields.BankTextField,
                        isBankingField: true,
                        disableCopyPaste: true,
                        validator: createValidator(
                            'bankRoutingNumber',
                            t('formValidation.routingNumberDoesNotMatch')
                        ),
                    },
                    {
                        fieldName: BankingFields.AccountHolder,
                        fieldLabel: t('distributionMethod.accountName'),
                        component: DisbursementFields.BankTextField,
                        classNames: 'col-start-1',
                    },
                    {
                        fieldName: BankingFields.BankName,
                        fieldLabel: t('distributionMethod.bankName'),
                        component: DisbursementFields.BankTextField,
                        isBankingField: true,
                    },

                    {
                        fieldName: BankingFields.BankFurtherCreditName,
                        fieldLabel: t(
                            'distributionMethod.bankFurtherCreditName'
                        ),
                        component: DisbursementFields.BankTextField,
                    },
                    {
                        fieldName: BankingFields.BankFurtherCreditAccount,
                        fieldLabel: t(
                            'distributionMethod.bankFurtherCreditAccount'
                        ),
                        component: DisbursementFields.BankTextField,
                    },
                ],
                getDefaultPayload({
                    paymentMethod,
                    bank,
                    isAnnuitant,
                }: FormDisbursement) {
                    if (paymentMethod.text !== PaymentMethod.EFT) {
                        return DEFAULT_DISBURSEMENT_UPDATE;
                    }
                    const selectedBank = bank[0];
                    return {
                        ...DEFAULT_DISBURSEMENT_UPDATE,
                        isDirectDepositValid:
                            selectedBank?.isDirectDepositValid?.text ?? true,
                        accountHolder: selectedBank?.nameOnBankAccount ?? '',
                        accountNumber: selectedBank?.accountNumber ?? '',
                        accountType:
                            selectedBank?.accountType?.text ??
                            AccountType.Checking,
                        bankName: selectedBank?.bankName ?? '',
                        bankRoutingNumber: selectedBank?.routingNumber ?? '',
                        bankFurtherCreditAccount:
                            selectedBank?.bankFurtherCreditAccount ?? '',
                        bankFurtherCreditName:
                            selectedBank?.bankFurtherCreditName ?? '',
                        isDirectDeposit:
                            selectedBank?.isDirectDeposit?.text ?? true,
                        maskedAccountNumber:
                            selectedBank?.maskedAccountNumber ?? '',
                        isAnnuitant: isAnnuitant,
                    };
                },
                generatePayloadFromSelection: ({
                    accountNumber,
                    accountType,
                    bankName,
                    accountHolder,
                    bankFurtherCreditAccount,
                    bankFurtherCreditName,
                    bankRoutingNumber,
                    isDirectDepositValid,
                    maskedAccountNumber,
                    isDirectDeposit,
                    reEnterAccountNumber,
                    reEnterBankRoutingNumber,
                    isAnnuitant,
                }: DisbursementParts) => {
                    const bank = isDirectDeposit
                        ? [
                              {
                                  ...DEFAULT_BANK_DETAILS,
                                  maskedAccountNumber: null,
                                  accountNumber,
                                  accountType: {
                                      text: accountType,
                                  },
                                  bankName,
                                  nameOnBankAccount: accountHolder ?? '',
                                  routingNumber: bankRoutingNumber,
                                  bankFurtherCreditAccount,
                                  bankFurtherCreditName,
                                  isDirectDeposit: { text: true },
                                  isDirectDepositValid: {
                                      text: isDirectDepositValid,
                                  },
                                  reEnterAccountNumber,
                                  reEnterBankRoutingNumber,
                              },
                          ]
                        : [
                              {
                                  ...DEFAULT_BANK_DETAILS,
                                  isDirectDeposit: { text: false },
                                  maskedAccountNumber:
                                      maskedAccountNumber ?? null,
                              },
                          ];
                    return {
                        ...getDefaultFormDisbursementValues(),
                        paymentMethod: { text: PaymentMethod.EFT },
                        paymentMailType: { text: null },
                        bank: bank,
                        isAnnuitant: isAnnuitant,
                    };
                },
            },
            isDlic3pDisbursementChangesEnabled
                ? {
                      label: t('distributionMethod.sendCheck'),
                      value: FormDisbursementSelections.Check,
                      fields: [
                          {
                              fieldName: 'SendCheckSelect' as BankingFields,
                              component: DisbursementFields.SendCheckSelect,
                              classNames: 'col-start-1 col-span-2',
                              selectOptions: sendCheckOptions,
                              annuitantAddress: annuitantAddress,
                          },
                          {
                              fieldName: BankingFields.PayeeName,
                              fieldLabel: t('distributionMethod.payeeName'),
                              classNames: 'col-start-1 col-span-2 max-w-lg',
                              component: DisbursementFields.BankTextField,
                              shouldDisplay: ({
                                  formDisbursement,
                              }: OtpWithdrawalFormState): boolean => {
                                  return shouldDisplayPayeeName(
                                      formDisbursement
                                  );
                              },
                          },
                          {
                              fieldName: BankingFields.Address,
                              fieldLabel: '',
                              classNames: 'col-span-3',
                              component: DisbursementFields.BankAddress,
                              isAddressLine2Required: true,
                              annuitantAddress: annuitantAddress,
                              shouldDisplay: ({
                                  formDisbursement,
                              }: OtpWithdrawalFormState): boolean => {
                                  return shouldDisplayAddress(formDisbursement);
                              },
                          },
                      ].filter(Boolean),
                      getDefaultPayload: ({
                          paymentMethod,
                          paymentMailType,
                          payee,
                          isPayeeFinancialIns,
                          isAnnuitant,
                          isPayeeCharity,
                          isAddressDifferent,
                          isThirdPartyDisbursement,
                      }: FormDisbursement) => {
                          if (
                              paymentMethod.text === PaymentMailType.Check &&
                              paymentMailType.text === null
                          ) {
                              return {
                                  ...DEFAULT_DISBURSEMENT_UPDATE,
                                  isAddressDifferent:
                                      isAddressDifferent ?? false,
                                  isPayeeFinancialIns: isPayeeFinancialIns,
                                  isAnnuitant: isAnnuitant ?? false,
                                  isPayeeCharity: isPayeeCharity ?? false,
                                  isThirdPartyDisbursement:
                                      isThirdPartyDisbursement,
                                  address:
                                      payee?.addresses?.[0] || DEFAULT_ADDRESS,
                                  payeeName: payee?.name?.text ?? '',
                              };
                          }
                          return DEFAULT_DISBURSEMENT_UPDATE;
                      },
                      generatePayloadFromSelection: ({
                          payeeName,
                          address,
                          isPayeeFinancialIns,
                          isAnnuitant,
                          isPayeeCharity,
                          isAddressDifferent,
                          isThirdPartyDisbursement,
                      }: DisbursementParts) => {
                          return {
                              ...getDefaultFormDisbursementValues(),
                              paymentMethod: { text: PaymentMailType.Check },
                              paymentMailType: { text: null },
                              isAddressDifferent: isAddressDifferent ?? false,
                              isPayeeFinancialIns: isPayeeFinancialIns,
                              isAnnuitant: isAnnuitant ?? false,
                              isPayeeCharity: isPayeeCharity ?? false,
                              isThirdPartyDisbursement:
                                  isThirdPartyDisbursement,
                              payee: {
                                  name: { text: payeeName || null },
                                  addresses: [address || DEFAULT_ADDRESS],
                                  contractNumber: { text: null },
                              },
                          };
                      },
                  }
                : {
                      label: t('distributionMethod.sendCheck'),
                      value: FormDisbursementSelections.Check,
                      fields: [
                          {
                              fieldName: BankingFields.SelectIfPayeeIsDifferent,
                              fieldLabel: t(
                                  'distributionMethod.selectIfDifferentPayee'
                              ),
                              component: DisbursementFields.BankCheckboxField,
                              classNames: 'col-start-1 col-span-3',
                          },
                          {
                              fieldName: BankingFields.PayeeName,
                              fieldLabel: t('distributionMethod.payeeName'),
                              classNames: 'col-start-1 col-span-2 max-w-lg',
                              component: DisbursementFields.BankTextField,
                          },
                          {
                              fieldName: BankingFields.Address,
                              fieldLabel: '',
                              classNames: 'col-span-3',
                              component: DisbursementFields.BankAddress,
                              isAddressLine2Required: true,
                          },
                      ],
                      getDefaultPayload: ({
                          paymentMethod,
                          paymentMailType,
                          isDifferentPayeeOrAddress,
                          payee,
                      }: FormDisbursement) => {
                          if (
                              paymentMethod.text === PaymentMailType.Check &&
                              paymentMailType.text === null
                          ) {
                              return {
                                  ...DEFAULT_DISBURSEMENT_UPDATE,
                                  selectIfPayeeIsDifferent:
                                      isDifferentPayeeOrAddress.text ?? '',
                                  address:
                                      payee?.addresses?.[0] || DEFAULT_ADDRESS,
                                  payeeName: payee?.name?.text ?? '',
                              };
                          }
                          return DEFAULT_DISBURSEMENT_UPDATE;
                      },
                      generatePayloadFromSelection: ({
                          payeeName,
                          address,
                          selectIfPayeeIsDifferent,
                      }: DisbursementParts) => {
                          return {
                              ...getDefaultFormDisbursementValues(),
                              paymentMethod: { text: PaymentMailType.Check },
                              paymentMailType: { text: null },
                              isDifferentPayeeOrAddress: {
                                  text: selectIfPayeeIsDifferent || false,
                              },
                              payee: {
                                  name: { text: payeeName || null },
                                  addresses: [address || DEFAULT_ADDRESS],
                                  contractNumber: { text: null },
                              },
                          };
                      },
                  },
        ];
    };

    const signaturesConfig: SignatureValidationConfig[] = [
        {
            key: `sig-val-owner`,
            fields: [
                {
                    component: SignatureFields.SignatureType,
                    key: 'owner-type',
                },
                {
                    component: SignatureFields.SignaturePresent,
                    key: 'owner-sign-present',
                },
                {
                    component: SignatureFields.SignatureDate,
                    key: 'owner-date',
                },
                {
                    component: SignatureFields.SignGuaranteeStamp,
                    key: 'owner-sign-guarantee-stamp',
                },
            ],
            signatureType: SignatureValidationTypeWithdrawal.Owner,
        },
        {
            key: `sig-val-joint`,
            fields: [
                {
                    component: SignatureFields.SignatureType,
                    key: 'joint-type',
                },
                {
                    component: SignatureFields.SignaturePresent,
                    key: 'joint-sign-present',
                },
                {
                    component: SignatureFields.SignatureDate,
                    key: 'joint-date',
                },
                {
                    component: SignatureFields.SignGuaranteeStamp,
                    key: 'joint-sign-guarantee-stamp',
                },
            ],
            signatureType: SignatureValidationTypeWithdrawal.JointOwner,
            shouldDisplay: ({ formParty }: OtpWithdrawalFormState): boolean => {
                return !!formParty?.parties?.find(
                    (party) => party.partyRoleType === PartyRoles.JOINT_OWNER
                );
            },
        },
    ];

    const additionalWithholdingAmountConfig = {
        [TaxWithholdingPlace.Federal]: { amountType: AmountType.Percent },
    };

    const signaturesNotaryConfig = [
        {
            key: `sig-val-notary`,
            fields: [
                {
                    component: SignatureFields.SignatureType,
                    key: 'notary-type',
                },
                {
                    component: SignatureFields.SignaturePresent,
                    key: 'notary-present',
                },
                {
                    component: SignatureFields.NotaryStampValid,
                    key: 'notary-stamp-valid',
                },
                {
                    component: SignatureFields.CommissionExpireDate,
                    key: 'notary-commission-exp-date',
                },
            ],
            signatureType: SignatureValidationTypeWithdrawal.Notary,
        },
    ];

    const irsSignatureConfig = [
        {
            component: SignatureFields.SignaturePresent,
            key: 'irs-signature-sign-present',
        },
        {
            component: SignatureFields.SignatureDate,
            key: 'irs-signature-sign-date',
        },
    ];

    const eSignatureFieldConfig = {
        type: true,
        signPresent: true,
        date: true,
        auditTrial: true,
    };

    const sswUpdateFastOptions = [
        {
            label: t('sswProgram.sswUpdateOptions.new'),
            value: SswUpdateOption.NEW,
        },
        {
            label: t('sswProgram.sswUpdateOptions.bankUpdate'),
            value: SswUpdateOption.BANK_UPDATE,
        },
    ];

    return {
        formValidation,
        formPartyConfigs,
        systematicWithdrawalOptions,
        fundWithdrawnMethodOptions,
        w4pSignaturesConfig,
        disbursementOptions,
        disbursementOptionsV2,
        signaturesConfig,
        signaturesNotaryConfig,
        additionalWithholdingAmountConfig,
        irsSignatureConfig,
        eSignatureFieldConfig,
        sswUpdateFastOptions,
    };
}
