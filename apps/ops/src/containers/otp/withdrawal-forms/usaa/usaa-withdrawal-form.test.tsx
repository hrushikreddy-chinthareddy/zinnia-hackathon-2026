import { render, screen } from '@testing-library/react';

import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { TaskType } from '@deps/models/case/task';
import { CaseStatus } from '@deps/models/case/withdrawal/case';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import USAAWithdrawalForm from './usaa-withdrawal-form';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: DEFAULT_LOCALE },
    }),
}));

// Mock all child components
jest.mock('@deps/components/otp-withdrawal-form/amount-details', () => () => (
    <div data-testid="amount-details" />
));
jest.mock(
    '@deps/components/otp-withdrawal-form/form-party/form-party',
    () => () => <div data-testid="form-party" />
);
jest.mock(
    '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal',
    () => () => <div data-testid="form-program-partial-withdrawal" />
);
jest.mock(
    '@deps/components/otp-withdrawal-form/form-restriction/distribution-reason',
    () => () => <div data-testid="distribution-reason" />
);
jest.mock(
    '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution',
    () => () => <div data-testid="form-distribution" />
);
jest.mock('@deps/components/otp-withdrawal-form/tax-withholdings', () => () => (
    <div data-testid="tax-withholdings" />
));
jest.mock('@deps/components/otp-withdrawal-form/irs-withholdings', () => () => (
    <div data-testid="irs-withholding" />
));
jest.mock(
    '@deps/components/otp-withdrawal-form/form-disbursement-V2/form-disbursement-v2',
    () => () => <div data-testid="form-disbursement-v2" />
);
jest.mock(
    '@deps/components/otp-withdrawal-form/signature-validation/signature-validations',
    () => () => <div data-testid="signature-validations" />
);
jest.mock(
    '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation',
    () => () => <div data-testid="esignature-validation" />
);
jest.mock(
    '@deps/components/side-sheet/diary-notes/diary-notes-alert',
    () => () => <div data-testid="diary-notes-warning" />
);

const data = CaseDetails.data.formRequest;
const contextValue = {
    ...defaultFormDataContext,
    formSubtype: 'partialWithdrawal',
    formData: data.formData,
    formDisbursement: data.formDisbursement,
    formDistribution: data.formDistribution,
    formErrors: {},
    formFullSurrenderAck: data.formFullSurrenderAck,
    formLoan: data.formLoan,
    formParty: data.formParty,
    formProgram: data.formProgram,
    formRestriction: data.formRestriction,
    formSignature: data.formSignature,
    formSource: data.formSource,
    formTaxWithholding: data.formTaxWithholding,
    formTpaAuthorization: data.formTpaAuthorization,
    initialForm: {
        ...CaseDetails,
        caseId: 'CA0000034607',
        taskType: TaskType.Withdrawal,
        source: 'Zinnia.TaskManagement',
        carrier: 'USAA',
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
};

describe('USAAWithdrawalForm', () => {
    it('renders all main sections and DiaryNotesWarning when not read-only', () => {
        render(
            <FormDataContext.Provider value={contextValue as any}>
                <USAAWithdrawalForm />
            </FormDataContext.Provider>
        );
        expect(screen.getByTestId('form-party')).toBeInTheDocument();
        expect(screen.getByTestId('amount-details')).toBeInTheDocument();
        expect(
            screen.getByTestId('form-program-partial-withdrawal')
        ).toBeInTheDocument();
        expect(screen.getByTestId('distribution-reason')).toBeInTheDocument();
        expect(screen.getByTestId('form-distribution')).toBeInTheDocument();
        expect(screen.getByTestId('tax-withholdings')).toBeInTheDocument();
        expect(screen.getByTestId('irs-withholding')).toBeInTheDocument();
        expect(screen.getByTestId('form-disbursement-v2')).toBeInTheDocument();
        expect(screen.getByTestId('signature-validations')).toBeInTheDocument();
        expect(screen.getByTestId('esignature-validation')).toBeInTheDocument();
        expect(screen.getByTestId('diary-notes-warning')).toBeInTheDocument();
    });

    it('does not render DiaryNotesWarning when read-only', () => {
        render(
            <FormDataContext.Provider
                value={{ ...(contextValue as any), isFormStateReadOnly: true }}
            >
                <USAAWithdrawalForm />
            </FormDataContext.Provider>
        );
        expect(
            screen.queryByTestId('diary-notes-warning')
        ).not.toBeInTheDocument();
    });

    it('calls setFormValidator and setFormData on mount', () => {
        const setFormValidator = jest.fn();
        const setFormData = jest.fn();
        render(
            <FormDataContext.Provider
                value={{
                    ...(contextValue as any),
                    setFormValidator,
                    setFormData,
                }}
            >
                <USAAWithdrawalForm />
            </FormDataContext.Provider>
        );
        expect(setFormValidator).toHaveBeenCalled();
        expect(setFormData).toHaveBeenCalled();
    });
});
