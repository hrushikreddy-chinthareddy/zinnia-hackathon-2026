import { render, screen, waitFor } from '@testing-library/react';
import { TFunction } from 'next-i18next';

import { BankingFields } from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers';
import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { TaskType } from '@deps/models/case/task';
import {
    AddressTypes,
    CaseStatus,
    FormDisbursement,
    maritalStatusType,
    PartyRoles,
    PaymentMethod,
    PhoneTypes,
} from '@deps/models/case/withdrawal/case';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import { UsaaSSWForm } from './usaa-ssw-form';
import getUsaaConfig from './usaa-ssw-form-helpers';

jest.mock('@deps/hooks/useDebounce', () => {
    return jest.fn((value) => value);
});

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

jest.mock('@deps/queries/api/policies', () => ({
    getSpecialPrograms: jest.fn(() => {
        return Promise.resolve(null);
    }),
}));

afterEach(() => {
    jest.clearAllMocks();
});

jest.mock('@deps/utils/server-logging');

jest.mock('../../withdrawal-forms/utils/form-validator.helpers', () => ({
    ...jest.requireActual(
        '../../withdrawal-forms/utils/form-validator.helpers'
    ),
    validateSignESign: jest.fn(() => ({})),
}));

describe('getUsaaConfig DTCC Validation', () => {
    const mockT = jest.fn((key: string) => key) as unknown as TFunction;

    const createDtccFormDisbursement = (
        overrides: Partial<{
            participantId: string | null;
            contractNumber: string;
        }>
    ): FormDisbursement =>
        ({
            paymentMethod: { text: PaymentMethod.DTCC },
            participantId: {
                text: overrides.participantId ?? null,
            },
            bank: [
                {
                    accountNumber: overrides.contractNumber ?? '',
                    bankName: 'Test Bank',
                },
            ],
        } as FormDisbursement);

    describe('formValidation (isValidationV2Enabled = false)', () => {
        // When isValidationV2Enabled is false, formValidation (v1) is used which does NOT have DTCC validation
        const { formValidation } = getUsaaConfig(mockT, true, false);

        it('should NOT validate DTCC fields when participantId and contractNumber are both "0000"', () => {
            const formDisbursement = createDtccFormDisbursement({
                participantId: '0000',
                contractNumber: '0000',
            });

            const errors = formValidation({ formDisbursement });

            // formValidation (v1) does NOT have DTCC validation, so no error should be returned
            expect(errors[BankingFields.ContractNumber]).toBeUndefined();
        });

        it('should NOT validate DTCC fields when participantId is provided but contractNumber is empty', () => {
            const formDisbursement = createDtccFormDisbursement({
                participantId: '1234',
                contractNumber: '',
            });

            const errors = formValidation({ formDisbursement });

            // formValidation (v1) does NOT have DTCC validation, so no error should be returned
            expect(errors[BankingFields.ContractNumber]).toBeUndefined();
        });
    });

    describe('formValidation (isValidationV2Enabled = true, DTCC enabled)', () => {
        // When isValidationV2Enabled is true, formValidationV2 is used which includes DTCC validation
        const { formValidation } = getUsaaConfig(mockT, true, true);

        it('should return error when participantId is "0000" and contractNumber is "0000"', () => {
            const formDisbursement = createDtccFormDisbursement({
                participantId: '0000',
                contractNumber: '0000',
            });

            const errors = formValidation({ formDisbursement });

            expect(errors[BankingFields.ContractNumber]).toBe(
                'formValidation.participantIdCannotBeSubmitted'
            );
        });

        it('should return error when participantId is provided but contractNumber is empty', () => {
            const formDisbursement = createDtccFormDisbursement({
                participantId: '1234',
                contractNumber: '',
            });

            const errors = formValidation({ formDisbursement });

            expect(errors[BankingFields.ContractNumber]).toBe(
                'formValidation.contractNumberRequired'
            );
        });

        it('should NOT return error when participantId and contractNumber are valid', () => {
            const formDisbursement = createDtccFormDisbursement({
                participantId: '1234',
                contractNumber: '5678',
            });

            const errors = formValidation({ formDisbursement });

            expect(errors[BankingFields.ContractNumber]).toBeUndefined();
        });

        it('should NOT return error when participantId is empty', () => {
            const formDisbursement = createDtccFormDisbursement({
                participantId: '',
                contractNumber: '',
            });

            const errors = formValidation({ formDisbursement });

            expect(errors[BankingFields.ContractNumber]).toBeUndefined();
        });

        it('should NOT return error when participantId is null', () => {
            const formDisbursement = createDtccFormDisbursement({
                participantId: null,
                contractNumber: '',
            });

            const errors = formValidation({ formDisbursement });

            expect(errors[BankingFields.ContractNumber]).toBeUndefined();
        });

        it('should NOT return "0000" error when only participantId is "0000" but contractNumber is different', () => {
            const formDisbursement = createDtccFormDisbursement({
                participantId: '0000',
                contractNumber: '1234',
            });

            const errors = formValidation({ formDisbursement });

            expect(errors[BankingFields.ContractNumber]).toBeUndefined();
        });

        it('should NOT return "0000" error when only contractNumber is "0000" but participantId is different', () => {
            const formDisbursement = createDtccFormDisbursement({
                participantId: '1234',
                contractNumber: '0000',
            });

            const errors = formValidation({ formDisbursement });

            expect(errors[BankingFields.ContractNumber]).toBeUndefined();
        });
    });

    describe('formValidation (isValidationV2Enabled = true, DTCC disabled)', () => {
        // When isValidationV2Enabled is true but isDtccSectionEnabled is false
        const { formValidation } = getUsaaConfig(mockT, false, true);

        it('should NOT validate DTCC fields when isDtccSectionEnabled is false', () => {
            const formDisbursement = createDtccFormDisbursement({
                participantId: '0000',
                contractNumber: '0000',
            });

            const errors = formValidation({ formDisbursement });

            // DTCC validation should be skipped when isDtccSectionEnabled is false
            expect(errors[BankingFields.ContractNumber]).toBeUndefined();
        });
    });
});

describe('UsaaRmdForm', () => {
    window.HTMLElement.prototype.hasPointerCapture = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    const data = CaseDetails.data.formRequest;
    const formData = data.formData;
    const formDisbursement = data.formDisbursement;
    const formDistribution = data.formDistribution;
    const formErrors = {};
    const formFullSurrenderAck = data.formFullSurrenderAck;
    const formLoan = data.formLoan;
    const formProgram = data.formProgram;
    const formRestriction = data.formRestriction;
    const formSignature = data.formSignature;
    const formSource = data.formSource;
    const formTaxWithholding = data.formTaxWithholding;
    const formTpaAuthorization = data.formTpaAuthorization;

    describe('CSLN Section', () => {
        it('Should not render the CSLN Section for AZ', async () => {
            const setMockData = jest.fn();
            const formParty = {
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
                            text: '' as maritalStatusType | null,
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
                                state: 'AZ',
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
            };
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formData,
                        formDisbursement,
                        formDistribution,
                        formErrors,
                        formFullSurrenderAck,
                        formLoan,
                        formParty,
                        formProgram,
                        formRestriction,
                        formSignature,
                        formSource,
                        formTaxWithholding,
                        formTpaAuthorization,
                        initialForm: {
                            ...CaseDetails,
                            caseId: 'CA0000034607',
                            taskType: TaskType.Withdrawal,
                            source: 'Zinnia.TaskManagement',
                            carrier: 'DLIC',
                            createdDate: '',
                            updatedDate: '',
                            status: CaseStatus.Pending,
                            taskId: '6551c49b18a0092d07bfa9db',
                            data: {
                                ...CaseDetails.data,
                                agentEmailAddress: '',
                                documentNumber: '',
                                onbaseCaseId: '',
                            },
                        },
                        setFormData: setMockData,
                    }}
                >
                    <UsaaSSWForm />
                </FormDataContext.Provider>
            );

            const sectionTitle = await waitFor(() =>
                screen.queryByTestId('data-testid-csln-title')
            );

            expect(sectionTitle).not.toBeInTheDocument();
        });
    });
});
