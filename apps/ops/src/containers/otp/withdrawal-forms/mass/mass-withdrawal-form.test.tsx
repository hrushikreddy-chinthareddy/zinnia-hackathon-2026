import { render, screen } from '@testing-library/react';

import { FormDataContext, defaultFormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { TaskType } from '@deps/models/case/task';
import { CaseStatus } from '@deps/models/case/withdrawal/case';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import MassWithdrawalForm from './mass-withdrawal-form';
import { FormSubtype } from '../flic-withdrawal-form.helper';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

jest.mock('next/navigation', () => {
    return {
        __esModule: true,
        useSearchParams: () => ({
            get: () => {},
        }),
    };
});

jest.mock('@deps/utils/server-logging');


afterEach(() => {
    jest.clearAllMocks();
});

describe('MassWithdrawalForm', () => {
    // The form subtype can be set and updated successfully.

    window.HTMLElement.prototype.hasPointerCapture = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    const data = CaseDetails.data.formRequest;
    const formData = data.formData;
    const formDisbursement = data.formDisbursement;
    const formDistribution = data.formDistribution;
    const formErrors = {};
    const formFullSurrenderAck = data.formFullSurrenderAck;
    const formLoan = data.formLoan;
    const formParty = data.formParty;
    const formProgram = data.formProgram;
    const formRestriction = data.formRestriction;
    const formSignature = data.formSignature;
    const formSource = data.formSource;
    const formTaxWithholding = data.formTaxWithholding;
    const formTpaAuthorization = data.formTpaAuthorization;
    // const setMockData = jest.fn();

    describe('form sub types', () => {
        it('should set the form type partial default', () => {
            let args = {};
            const setMockData = jest.fn(cb => {
                args = cb(FormData);
                return args;
            });

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formSubtype: FormSubtype.PartialWithdrawal,
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
                            carrier: 'MASS',
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
                    <MassWithdrawalForm qualType="" />
                </FormDataContext.Provider>
            );

            // Get the form subtype select element
            const formSubtypeSelect = screen.getByTestId('form-type') as HTMLInputElement;
            expect(formSubtypeSelect).toBeInTheDocument();

            const option = screen.getByText('formSubtype.partialWithdrawal', {
                ignore: 'option',
            });

            expect(option).toBeInTheDocument();

            expect(setMockData).toHaveReturnedWith({
                formExtName: `MASS_REDEMPTION_${FormSubtype.PartialWithdrawal.toUpperCase()}_DIGITAL_FORM`,
                metaData: {
                    formId: null,
                    formNumber: '',
                    formType: `MASS_REDEMPTION_${FormSubtype.PartialWithdrawal.toUpperCase()}_DIGITAL_FORM`,
                },
            });
        });
        it('should able to set subtype successfully to full', async () => {
            let args = {};
            const setMockData = jest.fn(cb => {
                args = cb(FormData);
                return args;
            });

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formSubtype: FormSubtype.FullWithdrawal,
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
                            carrier: 'MASS',
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
                    <MassWithdrawalForm qualType="" />
                </FormDataContext.Provider>
            );

            // Get the form subtype select element
            const formSelect = screen.getByTestId('form-type');
            expect(formSelect).toBeInTheDocument();

            expect(setMockData).toHaveReturnedWith({
                formExtName: `MASS_REDEMPTION_${FormSubtype.FullWithdrawal.toUpperCase()}_DIGITAL_FORM`,
                metaData: {
                    formId: null,
                    formNumber: '',
                    formType: `MASS_REDEMPTION_${FormSubtype.FullWithdrawal.toUpperCase()}_DIGITAL_FORM`,
                },
            });
        });
    });
    describe('form party', () => {
        it('should render personal information if configs is passed', () => {
            let args = {};
            const setMockData = jest.fn(cb => {
                args = cb(FormData);
                return args;
            });
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
                            carrier: 'MASS',
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
                    <MassWithdrawalForm qualType="" />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('data-testid-form-party-title')).toBeInTheDocument();
        });
    });
});
