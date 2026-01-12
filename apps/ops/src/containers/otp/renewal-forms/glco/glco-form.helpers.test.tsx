import { TFunction } from 'next-i18next';

import { SignatureFields } from '@deps/components/otp-renewal-form/signature-validation/single-signature';
import { PartyFields } from '@deps/components/otp-withdrawal-form/form-party/party-helpers';
import {
    getTrasanctionsByIds,
    TransactionTypes,
} from '@deps/helpers/transaction-options.helpers';
import { Channel, RenewalPeriod } from '@deps/models/case/renewal/case-renewal';
import { renewalsFormParts } from '@deps/models/case/task';

import getGlcoConfig from './glco-form.helpers';

// Mock the transaction options helper
jest.mock('@deps/helpers/transaction-options.helpers', () => ({
    getTrasanctionsByIds: jest.fn(),
    TransactionTypes: {
        Percentage: 'percentage',
    },
}));

describe('glco-form.helpers', () => {
    let mockT: jest.MockedFunction<TFunction>;
    let mockGetTrasanctionsByIds: jest.MockedFunction<
        typeof getTrasanctionsByIds
    >;

    beforeEach(() => {
        // Mock translation function
        mockT = jest.fn((key: string, options?: any) => {
            if (key === 'renewalPeriodError') return 'Period must equal 100%';
            if (key === 'callReceivedDateError')
                return 'Call received date is required';
            if (key === 'primaryOwner') return 'Primary Owner';
            if (key === 'jointOwner') return 'Joint Owner';
            if (key === 'firstName') return 'First Name';
            if (key === 'middleName') return 'Middle Name';
            if (key === 'lastName') return 'Last Name';
            if (key === 'type') return 'Type';
            if (key === 'printedName') return 'Printed Name';
            if (key === 'signPresent') return 'Signature Present';
            if (key === 'date') return 'Date';
            if (key === 'periodLabel' && options?.year)
                return `${options.year} Year`;
            return key;
        }) as any;

        mockGetTrasanctionsByIds = getTrasanctionsByIds as jest.MockedFunction<
            typeof getTrasanctionsByIds
        >;
        mockGetTrasanctionsByIds.mockReturnValue([
            { label: 'Percentage', value: 'percentage' },
        ] as any);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getGlcoConfig', () => {
        it('should return all required configuration properties', () => {
            const config = getGlcoConfig(mockT);

            expect(config).toHaveProperty('formPartyConfigs');
            expect(config).toHaveProperty('signatureConfigs');
            expect(config).toHaveProperty('formValidation');
            expect(config).toHaveProperty('periodRadioItems');
            expect(config).toHaveProperty('transList');
        });

        it('should call translation function for all labels', () => {
            getGlcoConfig(mockT);

            expect(mockT).toHaveBeenCalledWith('primaryOwner');
            expect(mockT).toHaveBeenCalledWith('jointOwner');
            expect(mockT).toHaveBeenCalledWith('firstName');
            expect(mockT).toHaveBeenCalledWith('middleName');
            expect(mockT).toHaveBeenCalledWith('lastName');
            expect(mockT).toHaveBeenCalledWith('type');
            expect(mockT).toHaveBeenCalledWith('printedName');
            expect(mockT).toHaveBeenCalledWith('signPresent');
            expect(mockT).toHaveBeenCalledWith('date');
        });
    });

    describe('formPartyConfigs', () => {
        it('should return correct party configurations for Primary and Joint owners', () => {
            const config = getGlcoConfig(mockT);

            expect(config.formPartyConfigs).toHaveLength(2);
            expect(config.formPartyConfigs[0].partyRoleType).toBe('Primary');
            expect(config.formPartyConfigs[0].title).toBe('Primary Owner');
            expect(config.formPartyConfigs[1].partyRoleType).toBe('Joint');
            expect(config.formPartyConfigs[1].title).toBe('Joint Owner');
        });

        it('should have correct fields for Primary owner', () => {
            const config = getGlcoConfig(mockT);
            const primaryOwner = config.formPartyConfigs[0];

            expect(primaryOwner.fields).toHaveLength(3);
            expect(primaryOwner.fields[0]).toEqual({
                fieldName: PartyFields.FirstName,
                fieldLabel: 'First Name',
            });
            expect(primaryOwner.fields[1]).toEqual({
                fieldName: PartyFields.MiddleName,
                fieldLabel: 'Middle Name',
            });
            expect(primaryOwner.fields[2]).toEqual({
                fieldName: PartyFields.LastName,
                fieldLabel: 'Last Name',
            });
        });

        it('should have correct fields for Joint owner', () => {
            const config = getGlcoConfig(mockT);
            const jointOwner = config.formPartyConfigs[1];

            expect(jointOwner.fields).toHaveLength(3);
            expect(jointOwner.fields[0]).toEqual({
                fieldName: PartyFields.FirstName,
                fieldLabel: 'First Name',
            });
            expect(jointOwner.fields[1]).toEqual({
                fieldName: PartyFields.MiddleName,
                fieldLabel: 'Middle Name',
            });
            expect(jointOwner.fields[2]).toEqual({
                fieldName: PartyFields.LastName,
                fieldLabel: 'Last Name',
            });
        });
    });

    describe('signatureConfigs', () => {
        it('should return correct signature configurations for Primary and Joint signatures', () => {
            const config = getGlcoConfig(mockT);

            expect(config.signatureConfigs).toHaveLength(2);
            expect(config.signatureConfigs[0].signatureType).toBe('Primary');
            expect(config.signatureConfigs[1].signatureType).toBe('Joint');
        });

        it('should have correct fields for Primary signature', () => {
            const config = getGlcoConfig(mockT);
            const primarySignature = config.signatureConfigs[0];

            expect(primarySignature.fields).toHaveLength(4);
            expect(primarySignature.fields[0]).toEqual({
                fieldName: SignatureFields.SignatureType,
                fieldLabel: 'Type',
            });
            expect(primarySignature.fields[1]).toEqual({
                fieldName: SignatureFields.Name,
                fieldLabel: 'Printed Name',
            });
            expect(primarySignature.fields[2]).toEqual({
                fieldName: SignatureFields.SignaturePresent,
                fieldLabel: 'Signature Present',
            });
            expect(primarySignature.fields[3]).toEqual({
                fieldName: SignatureFields.SignatureDate,
                fieldLabel: 'Date',
            });
        });

        it('should have correct fields for Joint signature', () => {
            const config = getGlcoConfig(mockT);
            const jointSignature = config.signatureConfigs[1];

            expect(jointSignature.fields).toHaveLength(4);
            expect(jointSignature.fields[0]).toEqual({
                fieldName: SignatureFields.SignatureType,
                fieldLabel: 'Type',
            });
            expect(jointSignature.fields[1]).toEqual({
                fieldName: SignatureFields.Name,
                fieldLabel: 'Printed Name',
            });
            expect(jointSignature.fields[2]).toEqual({
                fieldName: SignatureFields.SignaturePresent,
                fieldLabel: 'Signature Present',
            });
            expect(jointSignature.fields[3]).toEqual({
                fieldName: SignatureFields.SignatureDate,
                fieldLabel: 'Date',
            });
        });
    });

    describe('periodRadioItems', () => {
        it('should return correct period radio items for 3, 5, and 7 years', () => {
            const config = getGlcoConfig(mockT);

            expect(config.periodRadioItems).toHaveLength(3);
            expect(config.periodRadioItems[0]).toEqual({
                label: '3 Year',
                value: RenewalPeriod.ThreeYear,
            });
            expect(config.periodRadioItems[1]).toEqual({
                label: '5 Year',
                value: RenewalPeriod.FiveYear,
            });
            expect(config.periodRadioItems[2]).toEqual({
                label: '7 Year',
                value: RenewalPeriod.SevenYear,
            });
        });

        it('should call translation function with correct year parameters', () => {
            getGlcoConfig(mockT);

            expect(mockT).toHaveBeenCalledWith('periodLabel', { year: 3 });
            expect(mockT).toHaveBeenCalledWith('periodLabel', { year: 5 });
            expect(mockT).toHaveBeenCalledWith('periodLabel', { year: 7 });
        });
    });

    describe('transList', () => {
        it('should call getTrasanctionsByIds with Percentage transaction type', () => {
            getGlcoConfig(mockT);

            expect(mockGetTrasanctionsByIds).toHaveBeenCalledWith([
                TransactionTypes.Percentage,
            ]);
        });

        it('should return the transactions list from getTrasanctionsByIds', () => {
            const mockTransList = [
                { label: 'Percentage', value: 'percentage' },
            ];
            mockGetTrasanctionsByIds.mockReturnValue(mockTransList as any);

            const config = getGlcoConfig(mockT);

            expect(config.transList).toEqual(mockTransList);
        });
    });

    describe('formValidation', () => {
        it('should return empty errors object when validation passes', () => {
            const config = getGlcoConfig(mockT);
            const formData: Partial<renewalsFormParts> = {
                subsequentTargetFunds: [
                    { value: '50' } as any,
                    { value: '50' } as any,
                ],
                channel: Channel.Form,
                renewalRequestSignDate: '2024-01-01',
            };

            const errors = config.formValidation(formData);

            expect(errors).toEqual({});
        });

        it('should return period error when subsequentTargetFunds do not sum to 100', () => {
            const config = getGlcoConfig(mockT);
            const formData: Partial<renewalsFormParts> = {
                subsequentTargetFunds: [
                    { value: '40' } as any,
                    { value: '30' } as any,
                ],
                channel: Channel.Form,
            };

            const errors = config.formValidation(formData);

            expect(errors).toHaveProperty('period');
            expect(errors.period).toBe('Period must equal 100%');
        });

        it('should return period error when subsequentTargetFunds sum exceeds 100', () => {
            const config = getGlcoConfig(mockT);
            const formData: Partial<renewalsFormParts> = {
                subsequentTargetFunds: [
                    { value: '60' } as any,
                    { value: '50' } as any,
                ],
                channel: Channel.Form,
            };

            const errors = config.formValidation(formData);

            expect(errors).toHaveProperty('period');
            expect(errors.period).toBe('Period must equal 100%');
        });

        it('should handle empty subsequentTargetFunds array', () => {
            const config = getGlcoConfig(mockT);
            const formData: Partial<renewalsFormParts> = {
                subsequentTargetFunds: [],
                channel: Channel.Form,
            };

            const errors = config.formValidation(formData);

            expect(errors).toHaveProperty('period');
            expect(errors.period).toBe('Period must equal 100%');
        });

        it('should return callReceivedDate error when channel is Phone and renewalRequestSignDate is missing', () => {
            const config = getGlcoConfig(mockT);
            const formData: Partial<renewalsFormParts> = {
                subsequentTargetFunds: [{ value: '100' } as any],
                channel: Channel.Phone,
                renewalRequestSignDate: undefined,
            };

            const errors = config.formValidation(formData);

            expect(errors).toHaveProperty('callReceivedDate');
            expect(errors.callReceivedDate).toBe(
                'Call received date is required'
            );
        });

        it('should not return callReceivedDate error when channel is Phone and renewalRequestSignDate is provided', () => {
            const config = getGlcoConfig(mockT);
            const formData: Partial<renewalsFormParts> = {
                subsequentTargetFunds: [{ value: '100' } as any],
                channel: Channel.Phone,
                renewalRequestSignDate: '2024-01-01',
            };

            const errors = config.formValidation(formData);

            expect(errors).not.toHaveProperty('callReceivedDate');
        });

        it('should not return callReceivedDate error when channel is Form', () => {
            const config = getGlcoConfig(mockT);
            const formData: Partial<renewalsFormParts> = {
                subsequentTargetFunds: [{ value: '100' } as any],
                channel: Channel.Form,
                renewalRequestSignDate: undefined,
            };

            const errors = config.formValidation(formData);

            expect(errors).not.toHaveProperty('callReceivedDate');
        });

        it('should return multiple errors when multiple validations fail', () => {
            const config = getGlcoConfig(mockT);
            const formData: Partial<renewalsFormParts> = {
                subsequentTargetFunds: [{ value: '50' } as any],
                channel: Channel.Phone,
                renewalRequestSignDate: undefined,
            };

            const errors = config.formValidation(formData);

            expect(errors).toHaveProperty('period');
            expect(errors).toHaveProperty('callReceivedDate');
            expect(errors.period).toBe('Period must equal 100%');
            expect(errors.callReceivedDate).toBe(
                'Call received date is required'
            );
        });

        it('should handle undefined formData parameter', () => {
            const config = getGlcoConfig(mockT);

            const errors = config.formValidation();

            expect(errors).toHaveProperty('period');
            expect(errors.period).toBe('Period must equal 100%');
        });

        it('should handle empty formData object', () => {
            const config = getGlcoConfig(mockT);

            const errors = config.formValidation({});

            expect(errors).toHaveProperty('period');
            expect(errors.period).toBe('Period must equal 100%');
        });

        it('should correctly sum decimal values in subsequentTargetFunds', () => {
            const config = getGlcoConfig(mockT);
            const formData: Partial<renewalsFormParts> = {
                subsequentTargetFunds: [
                    { value: '33.33' } as any,
                    { value: '33.33' } as any,
                    { value: '33.34' } as any,
                ],
                channel: Channel.Form,
            };

            const errors = config.formValidation(formData);

            expect(errors).toEqual({});
        });

        it('should handle string values that convert to numbers', () => {
            const config = getGlcoConfig(mockT);
            const formData: Partial<renewalsFormParts> = {
                subsequentTargetFunds: [
                    { value: '25' } as any,
                    { value: '25' } as any,
                    { value: '25' } as any,
                    { value: '25' } as any,
                ],
                channel: Channel.Form,
            };

            const errors = config.formValidation(formData);

            expect(errors).toEqual({});
        });
    });
});
