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
jest.mock('@deps/components/otp-withdrawal-form/amount-details', () => {
    const AmountDetailsMock = () => <div data-testid="amount-details" />;
    AmountDetailsMock.displayName = 'AmountDetailsMock';
    return AmountDetailsMock;
});
jest.mock('@deps/components/otp-withdrawal-form/form-party/form-party', () => {
    const FormPartyMock = () => <div data-testid="form-party" />;
    FormPartyMock.displayName = 'FormPartyMock';
    return FormPartyMock;
});
jest.mock(
    '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal',
    () => {
        const FormProgramPartialWithdrawalMock = () => (
            <div data-testid="form-program-partial-withdrawal" />
        );
        FormProgramPartialWithdrawalMock.displayName =
            'FormProgramPartialWithdrawalMock';
        return FormProgramPartialWithdrawalMock;
    }
);
jest.mock(
    '@deps/components/otp-withdrawal-form/form-restriction/distribution-reason',
    () => {
        const DistributionReasonMock = () => (
            <div data-testid="distribution-reason" />
        );
        DistributionReasonMock.displayName = 'DistributionReasonMock';
        return DistributionReasonMock;
    }
);
jest.mock(
    '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution',
    () => {
        const FormDistributionMock = () => (
            <div data-testid="form-distribution" />
        );
        FormDistributionMock.displayName = 'FormDistributionMock';
        return FormDistributionMock;
    }
);
jest.mock('@deps/components/otp-withdrawal-form/tax-withholdings', () => {
    const TaxWithholdingsMock = () => <div data-testid="tax-withholdings" />;
    TaxWithholdingsMock.displayName = 'TaxWithholdingsMock';
    return TaxWithholdingsMock;
});
jest.mock('@deps/components/otp-withdrawal-form/irs-withholdings', () => {
    const IrsWithholdingsMock = () => <div data-testid="irs-withholding" />;
    IrsWithholdingsMock.displayName = 'IrsWithholdingsMock';
    return IrsWithholdingsMock;
});
jest.mock(
    '@deps/components/otp-withdrawal-form/form-disbursement-V2/form-disbursement-v2',
    () => {
        const FormDisbursementV2Mock = () => (
            <div data-testid="form-disbursement-v2" />
        );
        FormDisbursementV2Mock.displayName = 'FormDisbursementV2Mock';
        return FormDisbursementV2Mock;
    }
);
jest.mock(
    '@deps/components/otp-withdrawal-form/signature-validation/signature-validations',
    () => {
        const SignatureValidationsMock = () => (
            <div data-testid="signature-validations" />
        );
        SignatureValidationsMock.displayName = 'SignatureValidationsMock';
        return SignatureValidationsMock;
    }
);
jest.mock(
    '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation',
    () => {
        const ESignatureValidationMock = () => (
            <div data-testid="esignature-validation" />
        );
        ESignatureValidationMock.displayName = 'ESignatureValidationMock';
        return ESignatureValidationMock;
    }
);
jest.mock('@deps/components/side-sheet/diary-notes/diary-notes-alert', () => {
    const DiaryNotesWarningMock = () => (
        <div data-testid="diary-notes-warning" />
    );
    DiaryNotesWarningMock.displayName = 'DiaryNotesWarningMock';
    return DiaryNotesWarningMock;
});

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
