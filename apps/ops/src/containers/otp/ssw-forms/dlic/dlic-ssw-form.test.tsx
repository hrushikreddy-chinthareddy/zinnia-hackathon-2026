import { render, screen, waitFor } from '@testing-library/react';

import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { TaskType } from '@deps/models/case/task';
import { CaseStatus } from '@deps/models/case/withdrawal/case';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import { DlicSSWForm } from './dlic-ssw-form';

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

jest.mock(
    '@deps/components/otp-withdrawal-form/form-disbursement-V2/form-disbursement-v2',
    () => ({
        __esModule: true,
        default: () => <div data-testid="form-disbursement-v2" />,
    })
);

describe('DlicSSWForm', () => {
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

    it('should set the form type and formExtName correctly and render Form Party', async () => {
        const setMockData = jest.fn();

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
                <DlicSSWForm />
            </FormDataContext.Provider>
        );

        const el = await waitFor(() =>
            screen.getByTestId('data-testid-form-party-title')
        );
        expect(el).toBeInTheDocument();
    });

    it('should render DiaryNotesWarning when isFormStateReadOnly is false', async () => {
        const setMockData = jest.fn();

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
                    isFormStateReadOnly: false,
                    setFormData: setMockData,
                }}
            >
                <DlicSSWForm />
            </FormDataContext.Provider>
        );

        // Use findByTestId to wait for the element to appear
        const diaryNotesWarning = await screen.findByTestId(
            'diary-notes-warning'
        );
        expect(diaryNotesWarning).toBeInTheDocument();
    });

    it('should render amount details', async () => {
        const setMockData = jest.fn();

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
                    isFormStateReadOnly: false,
                    setFormData: setMockData,
                }}
            >
                <DlicSSWForm />
            </FormDataContext.Provider>
        );

        const amountDetails = await waitFor(() =>
            screen.getByTestId('amount-details')
        );
        expect(amountDetails).toBeInTheDocument();
    });

    it('should render SswEditSelection with correct props', async () => {
        const setMockData = jest.fn();

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
                    isFormStateReadOnly: false,
                    setFormData: setMockData,
                }}
            >
                <DlicSSWForm />
            </FormDataContext.Provider>
        );

        const sswEditSelect = await waitFor(() =>
            screen.getByTestId('ssw-edit-select-dropdown')
        );

        const sswProgram = await waitFor(() =>
            screen.getByTestId('systematic-withdrawal-program')
        );
        expect(sswEditSelect).toBeInTheDocument();
        expect(sswProgram).toBeInTheDocument();
    });

    it('should render FormDisbursementV2 component', async () => {
        const setMockData = jest.fn();

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
                <DlicSSWForm />
            </FormDataContext.Provider>
        );

        const formDisbursementV2 = await waitFor(() =>
            screen.getByTestId('form-disbursement-v2')
        );
        expect(formDisbursementV2).toBeInTheDocument();
    });
});
