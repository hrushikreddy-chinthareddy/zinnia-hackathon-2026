import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CaseType } from '@deps/models/case/case';

import CreateCaseForm from './create-case-form';
import { SearchKeys } from './create-case-form.helpers';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('@deps/utils/carriers', () => ({
    getCarrierNameByClientId: (id: string) => `Carrier ${id}`,
}));

jest.mock('@deps/components/select/select', () => {
    const MockSelect = (props: any) => {
        const { label, onChange, value, options, disabled } = props;
        return (
            <label>
                {label}
                <select
                    data-testid={label}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                >
                    {options.map((option: any) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </label>
        );
    };
    MockSelect.displayName = 'MockSelect';
    return MockSelect;
});

describe('CreateCaseForm', () => {
    const baseProps = {
        caseType: CaseType.Renewal,
        clientIds: ['client1', 'client2'],
        clientId: 'client1',
        onClientChange: jest.fn(),
        documentNumber: '',
        setDocumentNumber: jest.fn(),
        createCase: jest.fn(),
        errorMessage: '',
        shouldShowReg60Case: false,
        onCaseTypeChange: jest.fn(),
        policyNumber: '',
        setPolicyNumber: jest.fn(),
        searchByOption: SearchKeys.DocumentNumber,
        setSearchByOption: jest.fn(),
    };

    it('renders all fields and labels', () => {
        render(<CreateCaseForm {...baseProps} />);
        expect(
            screen.getByLabelText('caseRenewal.caseCreate.caseType')
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('caseRenewal.caseCreate.client')
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('caseRenewal.caseCreate.documentId')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('create-case-search-button')
        ).toBeInTheDocument();
    });

    it('disables client selector if only one client ID', () => {
        render(<CreateCaseForm {...baseProps} clientIds={['client1']} />);
        const select = screen.getByLabelText(
            'caseRenewal.caseCreate.client'
        ) as HTMLSelectElement;
        expect(select).toBeDisabled();
    });

    it('calls createCase when button is clicked', async () => {
        render(<CreateCaseForm {...baseProps} />);

        const user = userEvent.setup();

        await user.click(screen.getByTestId('create-case-search-button'));

        expect(baseProps.createCase).toHaveBeenCalled();
    });

    it('calls onCaseTypeChange when case type is selected', () => {
        render(<CreateCaseForm {...baseProps} />);
        const select = screen.getByTestId('caseRenewal.caseCreate.caseType');
        fireEvent.change(select, { target: { value: CaseType.Oft } });
        expect(baseProps.onCaseTypeChange).toHaveBeenCalledWith(CaseType.Oft);
    });

    it('shows error message when provided', () => {
        render(<CreateCaseForm {...baseProps} errorMessage="Error here" />);
        expect(screen.getByText('Error here')).toBeInTheDocument();
    });

    it('renders search by option when isNewLayout is true (address change)', () => {
        render(
            <CreateCaseForm {...baseProps} caseType={CaseType.AddressChange} />
        );
        expect(
            screen.getByText('dashboard.search.searchKeyType')
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('caseRenewal.caseCreate.documentId')
        ).toBeInTheDocument();
    });

    it('renders policy number field when selected from search toggle', () => {
        render(
            <CreateCaseForm
                {...baseProps}
                caseType={CaseType.ReReg}
                searchByOption={SearchKeys.PolicyNumber}
            />
        );
        expect(
            screen.getByLabelText('caseRenewal.caseCreate.policyNumber')
        ).toBeInTheDocument();
    });
});
