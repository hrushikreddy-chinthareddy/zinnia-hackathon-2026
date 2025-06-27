import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { TaskType } from '@deps/models/case/task';
import {
    AccountCloseReason,
    CaseStatus,
    QualTypes,
} from '@deps/models/case/withdrawal/case';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import FlicWithdrawalForm from './flic-withdrawal-form';
import { FormSubtype } from './flic-withdrawal-form.helpers';

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

describe('FLIC Form Specific component', () => {
    // added below code t fix the dropdown target.hasPointerCapture is not a function issue
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

    it('should render the partial formtype default', () => {
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
                        caseId: 'CA0000034607',
                        taskType: TaskType.Withdrawal,
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
                <FlicWithdrawalForm
                    qualType={QualTypes.ConvertedRothIRA}
                    isLC={true}
                />
            </FormDataContext.Provider>
        );

        expect(setMockData).toHaveBeenCalledWith({
            formExtName: `FLIC_WD_REDEMPTION_${FormSubtype.PartialWithdrawal.toUpperCase()}_DIGITAL_FORM`,
            metaData: {
                formId: null,
                formNumber: '',
                formType: `FLIC_WD_REDEMPTION_${FormSubtype.PartialWithdrawal.toUpperCase()}_DIGITAL_FORM`,
            },
        });
    });

    it('should correctly render the formData payload on formType Full', async () => {
        const setMockData = jest.fn();

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
                    currentFormState: CaseStatus.Pending,
                    initialForm: {
                        ...CaseDetails,
                        caseId: 'CA0000034607',
                        taskType: TaskType.Withdrawal,
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
                <FlicWithdrawalForm
                    qualType={QualTypes.ConvertedRothIRA}
                    isLC={true}
                />
            </FormDataContext.Provider>
        );

        const formSelect = screen.getByTestId('form-type');
        expect(formSelect).toBeInTheDocument();
        expect(setMockData).toHaveBeenCalledWith({
            formExtName: `FLIC_WD_REDEMPTION_${FormSubtype.FullWithdrawal?.toUpperCase()}_DIGITAL_FORM`,
            metaData: {
                formId: null,
                formNumber: '',
                formType: `FLIC_WD_REDEMPTION_${FormSubtype.FullWithdrawal?.toUpperCase()}_DIGITAL_FORM`,
            },
        });
    });

    it('should correctly render the formData payload on formType Partial', async () => {
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
                        caseId: 'CA0000034607',
                        taskType: TaskType.Withdrawal,
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
                <FlicWithdrawalForm
                    qualType={QualTypes.ConvertedRothIRA}
                    isLC={true}
                />
            </FormDataContext.Provider>
        );

        const formSelect = screen.getByTestId('form-type');
        expect(formSelect).toBeInTheDocument();
        await waitFor(() => {
            userEvent.click(formSelect);

            const formTypeElement = screen.getByText(
                'formSubtype.partialWithdrawal',
                { ignore: 'option' }
            );
            userEvent.click(formTypeElement);
        });

        expect(setMockData).toHaveBeenCalledWith({
            formExtName: `FLIC_WD_REDEMPTION_${FormSubtype.PartialWithdrawal.toUpperCase()}_DIGITAL_FORM`,
            metaData: {
                formId: null,
                formNumber: '',
                formType: `FLIC_WD_REDEMPTION_${FormSubtype.PartialWithdrawal.toUpperCase()}_DIGITAL_FORM`,
            },
        });
    });

    it('should render the Partial Withdrawal component when partial formType selected', async () => {
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
                <FlicWithdrawalForm
                    qualType={QualTypes.ConvertedRothIRA}
                    isLC={true}
                />
            </FormDataContext.Provider>
        );

        const formSelect = screen.getByTestId('form-type');
        expect(formSelect).toBeInTheDocument();

        await userEvent.click(formSelect);

        const partilWithdrawalContainer = screen.queryByTestId(
            'partial-withdrawal-program'
        );
        expect(partilWithdrawalContainer).toBeInTheDocument();
    });

    it('should render the Full Withdrawal component when full formType selected', async () => {
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
                <FlicWithdrawalForm
                    qualType={QualTypes.ConvertedRothIRA}
                    isLC={true}
                />
            </FormDataContext.Provider>
        );

        const formSelect = screen.getByTestId('form-type');
        expect(formSelect).toBeInTheDocument();
        const fullWithdrawalContainer = screen.queryByTestId(
            'full-withdrawal-program'
        );
        expect(fullWithdrawalContainer).toBeInTheDocument();
        const surrenderOption = screen.queryByTestId(
            AccountCloseReason.Surrender
        );
        expect(surrenderOption).toBeInTheDocument();
        const ContractAttached = screen.queryByText(
            AccountCloseReason.ContractAttached
        );
        expect(ContractAttached).not.toBeInTheDocument();
        const ContractLost = screen.queryByText(
            AccountCloseReason.ContractLost
        );
        expect(ContractLost).not.toBeInTheDocument();
    });
});
