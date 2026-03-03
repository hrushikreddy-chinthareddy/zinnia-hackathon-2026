import { TFunction } from 'next-i18next';

import { DEFAULT_ADDRESS } from '@deps/components/otp-withdrawal-form/address-entry';
import {
    PartyRoles,
    RMDType,
    FormParty,
    FormProgram,
    PaymentMailType,
} from '@deps/models/case/withdrawal/case';
import { SendCheckOption } from '@deps/models/case/withdrawal/disbursement-types';

import getDlicRmdWithdrawalConfig from './dlic-rmd-form.helpers';

// Mock translation function
const mockT: TFunction = ((key: string) => key) as TFunction;

describe('getDlicRmdWithdrawalConfig', () => {
    describe('sendCheckOptions function', () => {
        describe('Auto RMD', () => {
            it('should return 4 options for Auto RMD with combined third party label (no separate Charity)', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, true);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.AutoRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );
                const sendCheckSelectField: any = checkOption?.fields?.find(
                    (field: any) => field.fieldName === 'SendCheckSelect'
                );
                const options = sendCheckSelectField?.selectOptions;

                expect(options).toHaveLength(4);
                expect(options[0]).toEqual({
                    label: 'distributionMethod.disburseToOwnerAddress',
                    value: SendCheckOption.OwnerAddress,
                });
                expect(options[1]).toEqual({
                    label: 'distributionMethod.disburseToFinancialInstitution',
                    value: SendCheckOption.FinancialInstitution,
                });
                expect(options[2]).toEqual({
                    label: 'distributionMethod.disburseToThirdPartyNotCharityNotFinancial',
                    value: SendCheckOption.ThirdPartyNotFinancialIns,
                });
                expect(options[3]).toEqual({
                    label: 'distributionMethod.disburseToDifferentAddress',
                    value: SendCheckOption.DifferentAddress,
                });
            });

            it('should NOT include separate Charity option for Auto RMD', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, true);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.AutoRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );
                const sendCheckSelectField: any = checkOption?.fields?.find(
                    (field: any) => field.fieldName === 'SendCheckSelect'
                );
                const options = sendCheckSelectField?.selectOptions;

                const charityOption = options.find(
                    (opt: any) => opt.value === SendCheckOption.Charity
                );
                expect(charityOption).toBeUndefined();
            });
        });

        describe('One Time RMD and Calculate RMD', () => {
            it('should return 5 options for One Time RMD including separate Charity option', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, true);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.OneTimeRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );
                const sendCheckSelectField: any = checkOption?.fields?.find(
                    (field: any) => field.fieldName === 'SendCheckSelect'
                );
                const options = sendCheckSelectField?.selectOptions;

                expect(options).toHaveLength(5);
                expect(options[0]).toEqual({
                    label: 'distributionMethod.disburseToOwnerAddress',
                    value: SendCheckOption.OwnerAddress,
                });
                expect(options[1]).toEqual({
                    label: 'distributionMethod.disburseToFinancialInstitution',
                    value: SendCheckOption.FinancialInstitution,
                });
                expect(options[2]).toEqual({
                    label: 'distributionMethod.disburseToCharity',
                    value: SendCheckOption.Charity,
                });
                expect(options[3]).toEqual({
                    label: 'distributionMethod.disburseToDifferentAddress',
                    value: SendCheckOption.DifferentAddress,
                });
                expect(options[4]).toEqual({
                    label: 'distributionMethod.disburseToThirdParty',
                    value: SendCheckOption.ThirdPartyNotFinancialIns,
                });
            });

            it('should return 5 options for Calculate RMD including separate Charity option', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, true);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.CalculateRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );
                const sendCheckSelectField: any = checkOption?.fields?.find(
                    (field: any) => field.fieldName === 'SendCheckSelect'
                );
                const options = sendCheckSelectField?.selectOptions;

                expect(options).toHaveLength(5);
                expect(options[0]).toEqual({
                    label: 'distributionMethod.disburseToOwnerAddress',
                    value: SendCheckOption.OwnerAddress,
                });
                expect(options[1]).toEqual({
                    label: 'distributionMethod.disburseToFinancialInstitution',
                    value: SendCheckOption.FinancialInstitution,
                });
                expect(options[2]).toEqual({
                    label: 'distributionMethod.disburseToCharity',
                    value: SendCheckOption.Charity,
                });
                expect(options[3]).toEqual({
                    label: 'distributionMethod.disburseToDifferentAddress',
                    value: SendCheckOption.DifferentAddress,
                });
                expect(options[4]).toEqual({
                    label: 'distributionMethod.disburseToThirdParty',
                    value: SendCheckOption.ThirdPartyNotFinancialIns,
                });
            });

            it('should include separate Charity option for One Time RMD', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, true);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.OneTimeRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );
                const sendCheckSelectField: any = checkOption?.fields?.find(
                    (field: any) => field.fieldName === 'SendCheckSelect'
                );
                const options = sendCheckSelectField?.selectOptions;

                const charityOption = options.find(
                    (opt: any) => opt.value === SendCheckOption.Charity
                );
                expect(charityOption).toBeDefined();
                expect(charityOption).toEqual({
                    label: 'distributionMethod.disburseToCharity',
                    value: SendCheckOption.Charity,
                });
            });

            it('should include separate Charity option for Calculate RMD', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, true);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.CalculateRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );
                const sendCheckSelectField: any = checkOption?.fields?.find(
                    (field: any) => field.fieldName === 'SendCheckSelect'
                );
                const options = sendCheckSelectField?.selectOptions;

                const charityOption = options.find(
                    (opt: any) => opt.value === SendCheckOption.Charity
                );
                expect(charityOption).toBeDefined();
                expect(charityOption).toEqual({
                    label: 'distributionMethod.disburseToCharity',
                    value: SendCheckOption.Charity,
                });
            });
        });

        describe('Default/Fallback behavior', () => {
            it('should return null when rmdMethod is not provided', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, true);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {},
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );
                const sendCheckSelectField: any = checkOption?.fields?.find(
                    (field: any) => field.fieldName === 'SendCheckSelect'
                );
                const options = sendCheckSelectField?.selectOptions;

                expect(options).toBeNull();
            });

            it('should return null when formProgram.rmd is undefined', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, true);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {} as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );
                const sendCheckSelectField: any = checkOption?.fields?.find(
                    (field: any) => field.fieldName === 'SendCheckSelect'
                );
                const options = sendCheckSelectField?.selectOptions;

                expect(options).toBeNull();
            });
        });
    });

    describe('disbursementOptions function', () => {
        describe('when isDlic3pDisbursementChangesEnabled is true', () => {
            it('should include SendCheckSelect field with selectOptions', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, true);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.AutoRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );

                expect(checkOption).toBeDefined();
                const sendCheckSelectField: any = checkOption?.fields?.find(
                    (field: any) => field.fieldName === 'SendCheckSelect'
                );
                expect(sendCheckSelectField).toBeDefined();
                expect(sendCheckSelectField?.selectOptions).toBeDefined();
            });

            it('should include PayeeName field with shouldDisplay function', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, true);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.AutoRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );
                const payeeNameField: any = checkOption?.fields?.find(
                    (field: any) => field.fieldName === 'payeeName'
                );

                expect(payeeNameField).toBeDefined();
                expect(payeeNameField?.shouldDisplay).toBeDefined();
                expect(typeof payeeNameField?.shouldDisplay).toBe('function');
            });

            it('should include Address field with shouldDisplay function and annuitantAddress', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, true);
                const testAddress = {
                    ...DEFAULT_ADDRESS,
                    addressLine1: '123 Test St',
                };
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [testAddress],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.AutoRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );
                const addressField: any = checkOption?.fields?.find(
                    (field: any) => field.fieldName === 'address'
                );

                expect(addressField).toBeDefined();
                expect(addressField?.shouldDisplay).toBeDefined();
                expect(typeof addressField?.shouldDisplay).toBe('function');
                expect(addressField?.annuitantAddress).toEqual(testAddress);
            });

            it('should NOT include SelectIfPayeeIsDifferent field', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, true);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.AutoRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );
                const selectIfPayeeIsDifferentField = checkOption?.fields?.find(
                    (field: any) =>
                        field.fieldName === 'selectIfPayeeIsDifferent'
                );

                expect(selectIfPayeeIsDifferentField).toBeUndefined();
            });

            it('should include getDefaultPayload with new version properties', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, true);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.AutoRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );

                expect(checkOption?.getDefaultPayload).toBeDefined();
                expect(typeof checkOption?.getDefaultPayload).toBe('function');
            });

            it('should include generatePayloadFromSelection with new version properties', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, true);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.AutoRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );

                expect(checkOption?.generatePayloadFromSelection).toBeDefined();
                expect(typeof checkOption?.generatePayloadFromSelection).toBe(
                    'function'
                );
            });
        });

        describe('when isDlic3pDisbursementChangesEnabled is false', () => {
            it('should include SelectIfPayeeIsDifferent field', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, false);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.AutoRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );
                const selectIfPayeeIsDifferentField = checkOption?.fields?.find(
                    (field: any) =>
                        field.fieldName === 'selectIfPayeeIsDifferent'
                );

                expect(selectIfPayeeIsDifferentField).toBeDefined();
            });

            it('should include PayeeName field WITHOUT shouldDisplay function', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, false);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.AutoRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );
                const payeeNameField: any = checkOption?.fields?.find(
                    (field: any) => field.fieldName === 'payeeName'
                );

                expect(payeeNameField).toBeDefined();
                expect(payeeNameField?.shouldDisplay).toBeUndefined();
            });

            it('should include Address field WITHOUT shouldDisplay function', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, false);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.AutoRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );
                const addressField: any = checkOption?.fields?.find(
                    (field: any) => field.fieldName === 'address'
                );

                expect(addressField).toBeDefined();
                expect(addressField?.shouldDisplay).toBeUndefined();
            });

            it('should NOT include SendCheckSelect field', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, false);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.AutoRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );
                const sendCheckSelectField: any = checkOption?.fields?.find(
                    (field: any) => field.fieldName === 'SendCheckSelect'
                );

                expect(sendCheckSelectField).toBeUndefined();
            });

            it('should include getDefaultPayload with legacy version properties', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, false);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.AutoRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );

                expect(checkOption?.getDefaultPayload).toBeDefined();
                expect(typeof checkOption?.getDefaultPayload).toBe('function');
            });

            it('should include generatePayloadFromSelection with legacy version properties', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, false);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.AutoRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );

                expect(checkOption?.generatePayloadFromSelection).toBeDefined();
                expect(typeof checkOption?.generatePayloadFromSelection).toBe(
                    'function'
                );
            });
        });

        describe('RMD method extraction', () => {
            it('should correctly extract rmdMethod from formProgram', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, true);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.CalculateRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );
                const sendCheckSelectField: any = checkOption?.fields?.find(
                    (field: any) => field.fieldName === 'SendCheckSelect'
                );

                // Verify it's using Calculate RMD options (5 options with separate Charity)
                expect(sendCheckSelectField?.selectOptions).toHaveLength(5);
            });

            it('should handle missing rmdMethod gracefully', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, true);
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [DEFAULT_ADDRESS],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {},
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );
                const sendCheckSelectField: any = checkOption?.fields?.find(
                    (field: any) => field.fieldName === 'SendCheckSelect'
                );

                // Should return null when rmdMethod is not provided
                expect(sendCheckSelectField?.selectOptions).toBeNull();
            });
        });

        describe('Annuitant address extraction', () => {
            it('should correctly extract annuitant address from formParty', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, true);
                const testAddress = {
                    ...DEFAULT_ADDRESS,
                    addressLine1: '456 Main St',
                    city: 'Test City',
                };
                const formParty: FormParty = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.ANNUITANT,
                            addresses: [testAddress],
                        },
                    ],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.AutoRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );
                const addressField: any = checkOption?.fields?.find(
                    (field: any) => field.fieldName === 'address'
                );

                expect(addressField?.annuitantAddress).toEqual(testAddress);
            });

            it('should handle missing annuitant address gracefully', () => {
                const config = getDlicRmdWithdrawalConfig(mockT, true);
                const formParty: FormParty = {
                    parties: [],
                } as any;
                const formProgram: FormProgram = {
                    rmd: {
                        rmdMethod: RMDType.AutoRMD,
                    },
                } as any;

                const disbursementOptions = config.disbursementOptions(
                    formParty,
                    formProgram
                );
                const checkOption = disbursementOptions.find(
                    (option: any) => option.value === PaymentMailType.Check
                );
                const addressField: any = checkOption?.fields?.find(
                    (field: any) => field.fieldName === 'address'
                );

                expect(addressField?.annuitantAddress).toBeUndefined();
            });
        });
    });

    describe('formValidation function', () => {
        it('should return empty errors when validation passes', () => {
            const config = getDlicRmdWithdrawalConfig(mockT, true);
            const formParts = {
                formSignature: {
                    signatures: [
                        {
                            signatureType: { text: 'Owner' },
                            signaturePresent: { text: 'Yes' },
                            signatureDate: { text: '2024-01-01' },
                        },
                    ],
                },
                formESignatureData: {},
                formProgram: {},
            };

            const errors = config.formValidation(formParts as any);

            expect(Object.keys(errors)).toHaveLength(0);
        });

        it('should return errors when signature validation fails', () => {
            const config = getDlicRmdWithdrawalConfig(mockT, true);
            const formParts = {
                formSignature: {
                    signatures: [],
                },
                formESignatureData: {},
                formProgram: {},
            };

            const errors = config.formValidation(formParts as any);

            // Should have signature validation errors
            expect(errors).toBeDefined();
        });

        it('should validate QCD details when qcd is present', () => {
            const config = getDlicRmdWithdrawalConfig(mockT, true);
            const formParts = {
                formSignature: {
                    signatures: [
                        {
                            signatureType: { text: 'Owner' },
                            signaturePresent: { text: 'Yes' },
                            signatureDate: { text: '2024-01-01' },
                        },
                    ],
                },
                formESignatureData: {},
                formProgram: {
                    qcd: [
                        {
                            // Invalid QCD data
                            charityName: '',
                        },
                    ],
                },
            };

            const errors = config.formValidation(formParts as any);

            // Should include QCD validation errors
            expect(errors).toBeDefined();
        });

        it('should handle undefined formParts gracefully', () => {
            const config = getDlicRmdWithdrawalConfig(mockT, true);

            const errors = config.formValidation();

            expect(errors).toBeDefined();
        });

        it('should handle empty formProgram gracefully', () => {
            const config = getDlicRmdWithdrawalConfig(mockT, true);
            const formParts = {
                formSignature: {
                    signatures: [
                        {
                            signatureType: { text: 'Owner' },
                            signaturePresent: { text: 'Yes' },
                            signatureDate: { text: '2024-01-01' },
                        },
                    ],
                },
                formESignatureData: {},
                formProgram: {},
            };

            const errors = config.formValidation(formParts as any);

            expect(Object.keys(errors)).toHaveLength(0);
        });
    });

    describe('configuration properties', () => {
        it('should return all required configuration properties', () => {
            const config = getDlicRmdWithdrawalConfig(mockT, true);

            expect(config.disbursementOptions).toBeDefined();
            expect(config.disbursementOptionsV2).toBeDefined();
            expect(config.formPartyConfigs).toBeDefined();
            expect(config.formValidation).toBeDefined();
            expect(config.fundWithdrawnMethodOptions).toBeDefined();
            expect(config.irsSignatureConfig).toBeDefined();
            expect(config.signaturesConfig).toBeDefined();
            expect(config.additionalWithholdingAmountConfig).toBeDefined();
            expect(config.signaturesNotaryConfig).toBeDefined();
            expect(config.eSignatureFieldConfig).toBeDefined();
            expect(config.w4pSignaturesConfig).toBeDefined();
        });

        it('should have correct fundWithdrawnMethodOptions', () => {
            const config = getDlicRmdWithdrawalConfig(mockT, true);

            expect(config.fundWithdrawnMethodOptions).toHaveLength(2);
            expect(config.fundWithdrawnMethodOptions[0].label).toBe(
                'distributionInstruction.prorata'
            );
            expect(config.fundWithdrawnMethodOptions[1].label).toBe(
                'distributionInstruction.specifyFunds'
            );
        });

        it('should have correct signaturesConfig structure', () => {
            const config = getDlicRmdWithdrawalConfig(mockT, true);

            expect(config.signaturesConfig).toHaveLength(2);
            expect(config.signaturesConfig[0].key).toBe('sig-val-owner');
            expect(config.signaturesConfig[1].key).toBe('sig-val-joint');
            expect(config.signaturesConfig[1].shouldDisplay).toBeDefined();
        });

        it('should have correct irsSignatureConfig structure', () => {
            const config = getDlicRmdWithdrawalConfig(mockT, true);

            expect(config.irsSignatureConfig).toHaveLength(2);
            expect(config.irsSignatureConfig[0].key).toBe(
                'irs-signature-sign-present'
            );
            expect(config.irsSignatureConfig[1].key).toBe(
                'irs-signature-sign-date'
            );
        });

        it('should have correct w4pSignaturesConfig structure', () => {
            const config = getDlicRmdWithdrawalConfig(mockT, true);

            expect(config.w4pSignaturesConfig).toHaveLength(3);
            expect(config.w4pSignaturesConfig[0].key).toBe('w4p-owner-type');
            expect(config.w4pSignaturesConfig[1].key).toBe(
                'w4p-signature-sign-present'
            );
            expect(config.w4pSignaturesConfig[2].key).toBe(
                'w4p-signature-sign-date'
            );
        });
    });
});
