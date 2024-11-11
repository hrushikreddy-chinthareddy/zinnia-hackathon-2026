import { render, screen, waitFor } from '@testing-library/react';

import { FormDataContext, defaultFormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { TaskType } from '@deps/models/case/task';
import { CaseStatus, QualTypes } from '@deps/models/case/withdrawal/case';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import { FlicSSWForm } from './flic-ssw-form';
import { FormSubtype } from '../../withdrawal-forms/flic-withdrawal-form.helper';

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

describe('FlicSSWForm', () => {
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

    describe('form sub types', () => {
        it('should set the form type and formExtName correctly', async () => {
            const setMockData = jest.fn();

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
                            caseId: 'CA0000359968',
                            taskType: TaskType.SSW,
                            source: 'Zinnia.TaskManagement',
                            carrier: 'FLIC',
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
                    <FlicSSWForm qualType={QualTypes.CustInhIRA} />
                </FormDataContext.Provider>
            );

            const el = await waitFor(() => screen.getByTestId('data-testid-form-party-title'));
            expect(el).toBeInTheDocument();

            expect(setMockData).toHaveBeenCalledWith({
                formExtName: `FLIC_SSW_DIGITAL_FORM`,
                metaData: {
                    formId: null,
                    formNumber: '',
                    formType: `FLIC_SSW_DIGITAL_FORM`,
                },
            });
        });
    });

    describe('form party', () => {
        it('should render personal information if configs is passed', async () => {
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
                            caseId: 'CA0000359968',
                            taskType: TaskType.SSW,
                            source: 'Zinnia.TaskManagement',
                            carrier: 'FLIC',
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
                    }}
                >
                    <FlicSSWForm qualType={QualTypes.CustInhIRA} />
                </FormDataContext.Provider>
            );

            const el = await waitFor(() => screen.getByTestId('data-testid-form-party-title'));
            expect(el).toBeInTheDocument();
        });
    });
});
