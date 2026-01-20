import { render, screen } from '@testing-library/react';

import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { TaskType } from '@deps/models/case/task';
import { CaseStatus } from '@deps/models/case/withdrawal/case';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import DlicRmdWithdrawalForm from './dlic-rmd-form';
import { FormSubtype } from '../../withdrawal-forms/flic-withdrawal-form.helpers';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

jest.mock('next/navigation', () => ({
    __esModule: true,
    useSearchParams: () => ({
        get: () => {},
    }),
}));

jest.mock('@deps/utils/server-logging');

afterEach(() => {
    jest.clearAllMocks();
});

jest.mock('@deps/components/otp-withdrawal-form/state-w4-form', () => ({
    __esModule: true,
    default: () => <div data-testid="w4p-checkbox" />,
}));

jest.mock('@deps/utils/renderStateW4', () => ({
    ...jest.requireActual('@deps/utils/renderStateW4'),
    isAllowedState: jest.fn(() => true),
}));

jest.mock(
    '@deps/components/otp-withdrawal-form/form-disbursement-V2/form-disbursement-v2',
    () => ({
        __esModule: true,
        default: () => <div data-testid="form-disbursement-v2" />,
    })
);

const baseFormContext = {
    ...defaultFormDataContext,
    formData: CaseDetails.data.formRequest.formData,
    formDisbursement: CaseDetails.data.formRequest.formDisbursement,
    formDistribution: CaseDetails.data.formRequest.formDistribution,
    formErrors: {},
    formFullSurrenderAck: CaseDetails.data.formRequest.formFullSurrenderAck,
    formLoan: CaseDetails.data.formRequest.formLoan,
    formParty: CaseDetails.data.formRequest.formParty,
    formProgram: CaseDetails.data.formRequest.formProgram,
    formRestriction: CaseDetails.data.formRequest.formRestriction,
    formSignature: CaseDetails.data.formRequest.formSignature,
    formSource: CaseDetails.data.formRequest.formSource,
    formTaxWithholding: CaseDetails.data.formRequest.formTaxWithholding,
    formTpaAuthorization: CaseDetails.data.formRequest.formTpaAuthorization,
    contractIssueState: 'CT',
    initialForm: {
        ...CaseDetails,
        caseId: 'CA0000034607',
        taskType: TaskType.Withdrawal,
        source: 'Zinnia.TaskManagement',
        carrier: 'RMD',
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

const renderWithContext = ({
    formSubtype,
    setFormData = jest.fn(),
    ...overrides
}: Partial<typeof baseFormContext> & {
    formSubtype?: FormSubtype;
    setFormData?: any;
} = {}) => {
    return render(
        <FormDataContext.Provider
            value={{
                ...baseFormContext,
                ...overrides,
                formSubtype,
                setFormData,
            }}
        >
            <DlicRmdWithdrawalForm />
        </FormDataContext.Provider>
    );
};

describe('MassWithdrawalForm', () => {
    window.HTMLElement.prototype.hasPointerCapture = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    describe('Render Form Sections', () => {
        it('should render personal information if configs is passed', () => {
            renderWithContext();

            expect(
                screen.getByTestId('data-testid-form-party-title')
            ).toBeInTheDocument();
        });
    });

    describe('StateW4Form rendering', () => {
        it('should render StateW4Form when shouldStateW4pRender is true', async () => {
            renderWithContext({
                formProgram: {
                    ...baseFormContext.formProgram,
                    programType: { text: 'RMD' },
                },
            });

            expect(screen.getByTestId('w4p-checkbox')).toBeInTheDocument();
        });
    });

    describe('FormDisbursementV2 rendering', () => {
        it('should render FormDisbursementV2 component when form type is RMD', () => {
            renderWithContext({
                formProgram: {
                    ...baseFormContext.formProgram,
                    programType: { text: 'RMD' },
                },
            });

            expect(
                screen.getByTestId('form-disbursement-v2')
            ).toBeInTheDocument();
        });
    });
});
