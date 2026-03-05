import '@testing-library/jest-dom';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AddressTypes } from '@deps/models/case/withdrawal/case';
import { SendCheckOption } from '@deps/models/case/withdrawal/disbursement-types';

import SendCheckSelect from './select-send-check';
import { DEFAULT_ADDRESS } from '../../address-entry';

// Mock next-i18next
jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock the helper to avoid circular dependency issues
jest.mock('../form-disbursement.helpers', () => ({
    defaultSendCheckOptions: () => [
        { label: 'Select', value: 'select' },
        { label: 'Owner Address', value: 'Disburse to owner address' },
        {
            label: 'Financial Institution',
            value: 'Disburse to Financial Institution',
        },
        { label: 'Charity', value: 'Disburse to Charity' },
        { label: 'Annuitant', value: 'Disburse to Annuitant' },
        {
            label: 'Third Party',
            value: 'Disburse to Third Party(Not a Financial Institution / Charity)',
        },
        { label: 'Different Address', value: 'Disburse to Different Address' },
    ],
}));

// Mock SelectSimple to use native HTML select for easier testing
jest.mock('@deps/components/select/select', () => {
    const MockSelectSimple = (props: any) => (
        <div data-testid="select-simple-wrapper">
            <label>{props.label}</label>
            <select
                data-testid={props['data-testid'] || 'select-simple'}
                disabled={props.disabled}
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
            >
                {props.options?.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
    MockSelectSimple.displayName = 'MockSelectSimple';
    return {
        __esModule: true,
        default: MockSelectSimple,
    };
});

afterEach(cleanup);

describe('SendCheckSelect Component', () => {
    const mockOnDataChange = jest.fn();
    const mockAnnuitantAddress = {
        addressLine1: '123 Annuitant St',
        addressLine2: 'Apt 1',
        addressLine3: null,
        addressLine4: null,
        addressType: 'DEFAULT' as AddressTypes,
        city: 'Annuitant City',
        state: 'CA',
        zip: '90210',
        zipPlusFour: null,
        country: 'USA',
    };

    const defaultProps = {
        fieldName: 'SendCheckSelect' as any,
        fieldLabel: 'Send Check',
        classNames: 'col-span-2',
        isFormStateReadOnly: false,
        onDataChange: mockOnDataChange,
        disbursementInformation: {} as any,
    };

    beforeEach(() => {
        mockOnDataChange.mockClear();
    });

    it('should render the select component with default value', () => {
        render(<SendCheckSelect {...defaultProps} />);

        expect(screen.getByTestId('send-check-select')).toBeInTheDocument();
    });

    it('should be disabled when isFormStateReadOnly is true', () => {
        render(
            <SendCheckSelect {...defaultProps} isFormStateReadOnly={true} />
        );

        const select = screen.getByTestId('send-check-select');
        expect(select).toBeDisabled();
    });

    describe('SendCheckOption.Annuitant selection', () => {
        it('should set address to annuitantAddress when Annuitant is selected and annuitantAddress is provided', async () => {
            const user = userEvent.setup();
            render(
                <SendCheckSelect
                    {...defaultProps}
                    annuitantAddress={mockAnnuitantAddress}
                />
            );

            const select = screen.getByTestId('send-check-select');
            await user.selectOptions(select, SendCheckOption.Annuitant);

            await waitFor(() => {
                expect(mockOnDataChange).toHaveBeenCalled();
            });

            const onDataChangeCallback = mockOnDataChange.mock.calls[0][0];
            const result = onDataChangeCallback({});

            expect(result).toEqual({
                isPayeeFinancialIns: false,
                isPayeeCharity: false,
                isThirdPartyDisbursement: false,
                isAnnuitant: true,
                isAddressDifferent: false,
                address: mockAnnuitantAddress,
            });
        });

        it('should set address to DEFAULT_ADDRESS when Annuitant is selected but annuitantAddress is not provided', async () => {
            const user = userEvent.setup();
            render(<SendCheckSelect {...defaultProps} />);

            const select = screen.getByTestId('send-check-select');
            await user.selectOptions(select, SendCheckOption.Annuitant);

            await waitFor(() => {
                expect(mockOnDataChange).toHaveBeenCalled();
            });

            const onDataChangeCallback = mockOnDataChange.mock.calls[0][0];
            const result = onDataChangeCallback({});

            expect(result).toEqual({
                isPayeeFinancialIns: false,
                isPayeeCharity: false,
                isThirdPartyDisbursement: false,
                isAnnuitant: true,
                isAddressDifferent: false,
                address: DEFAULT_ADDRESS,
            });
        });

        it('should correctly pre-fill annuitant address when switching between options', async () => {
            const user = userEvent.setup();
            render(
                <SendCheckSelect
                    {...defaultProps}
                    annuitantAddress={mockAnnuitantAddress}
                />
            );

            const select = screen.getByTestId('send-check-select');

            // First, select Annuitant
            await user.selectOptions(select, SendCheckOption.Annuitant);

            await waitFor(() => {
                expect(mockOnDataChange).toHaveBeenCalled();
            });

            let onDataChangeCallback = mockOnDataChange.mock.calls[0][0];
            let result = onDataChangeCallback({});
            expect(result.address).toEqual(mockAnnuitantAddress);
            expect(result.isAnnuitant).toBe(true);

            mockOnDataChange.mockClear();

            // Then, switch to Financial Institution
            await user.selectOptions(
                select,
                SendCheckOption.FinancialInstitution
            );

            await waitFor(() => {
                expect(mockOnDataChange).toHaveBeenCalled();
            });

            onDataChangeCallback = mockOnDataChange.mock.calls[0][0];
            result = onDataChangeCallback({});
            expect(result.address).toEqual(DEFAULT_ADDRESS);
            expect(result.isAnnuitant).toBe(false);
            expect(result.isPayeeFinancialIns).toBe(true);

            mockOnDataChange.mockClear();

            // Finally, switch back to Annuitant - should still get annuitant address
            await user.selectOptions(select, SendCheckOption.Annuitant);

            await waitFor(() => {
                expect(mockOnDataChange).toHaveBeenCalled();
            });

            onDataChangeCallback = mockOnDataChange.mock.calls[0][0];
            result = onDataChangeCallback({});
            expect(result.address).toEqual(mockAnnuitantAddress);
            expect(result.isAnnuitant).toBe(true);
        });
    });

    describe('Other SendCheckOption selections', () => {
        it('should set correct flags for OwnerAddress', async () => {
            const user = userEvent.setup();
            render(<SendCheckSelect {...defaultProps} />);

            const select = screen.getByTestId('send-check-select');
            await user.selectOptions(select, SendCheckOption.OwnerAddress);

            await waitFor(() => {
                expect(mockOnDataChange).toHaveBeenCalled();
            });

            const onDataChangeCallback = mockOnDataChange.mock.calls[0][0];
            const result = onDataChangeCallback({});

            expect(result).toEqual({
                isPayeeFinancialIns: false,
                isPayeeCharity: false,
                isThirdPartyDisbursement: false,
                isAnnuitant: false,
                isAddressDifferent: false,
                address: DEFAULT_ADDRESS,
            });
        });

        it('should set correct flags for FinancialInstitution', async () => {
            const user = userEvent.setup();
            render(<SendCheckSelect {...defaultProps} />);

            const select = screen.getByTestId('send-check-select');
            await user.selectOptions(
                select,
                SendCheckOption.FinancialInstitution
            );

            await waitFor(() => {
                expect(mockOnDataChange).toHaveBeenCalled();
            });

            const onDataChangeCallback = mockOnDataChange.mock.calls[0][0];
            const result = onDataChangeCallback({});

            expect(result).toEqual({
                isPayeeFinancialIns: true,
                isPayeeCharity: false,
                isThirdPartyDisbursement: false,
                isAnnuitant: false,
                isAddressDifferent: false,
                address: DEFAULT_ADDRESS,
            });
        });

        it('should set correct flags for Charity', async () => {
            const user = userEvent.setup();
            render(<SendCheckSelect {...defaultProps} />);

            const select = screen.getByTestId('send-check-select');
            await user.selectOptions(select, SendCheckOption.Charity);

            await waitFor(() => {
                expect(mockOnDataChange).toHaveBeenCalled();
            });

            const onDataChangeCallback = mockOnDataChange.mock.calls[0][0];
            const result = onDataChangeCallback({});

            expect(result).toEqual({
                isPayeeFinancialIns: false,
                isPayeeCharity: true,
                isThirdPartyDisbursement: false,
                isAnnuitant: false,
                isAddressDifferent: false,
                address: DEFAULT_ADDRESS,
            });
        });

        it('should set correct flags for ThirdPartyNotFinancialIns', async () => {
            const user = userEvent.setup();
            render(<SendCheckSelect {...defaultProps} />);

            const select = screen.getByTestId('send-check-select');
            await user.selectOptions(
                select,
                SendCheckOption.ThirdPartyNotFinancialIns
            );

            await waitFor(() => {
                expect(mockOnDataChange).toHaveBeenCalled();
            });

            const onDataChangeCallback = mockOnDataChange.mock.calls[0][0];
            const result = onDataChangeCallback({});

            expect(result).toEqual({
                isPayeeFinancialIns: false,
                isPayeeCharity: false,
                isThirdPartyDisbursement: true,
                isAnnuitant: false,
                isAddressDifferent: false,
                address: DEFAULT_ADDRESS,
            });
        });

        it('should set correct flags for DifferentAddress', async () => {
            const user = userEvent.setup();
            render(<SendCheckSelect {...defaultProps} />);

            const select = screen.getByTestId('send-check-select');
            await user.selectOptions(select, SendCheckOption.DifferentAddress);

            await waitFor(() => {
                expect(mockOnDataChange).toHaveBeenCalled();
            });

            const onDataChangeCallback = mockOnDataChange.mock.calls[0][0];
            const result = onDataChangeCallback({});

            expect(result).toEqual({
                isPayeeFinancialIns: false,
                isPayeeCharity: false,
                isThirdPartyDisbursement: false,
                isAnnuitant: false,
                isAddressDifferent: true,
                address: DEFAULT_ADDRESS,
            });
        });
    });

    describe('Custom selectOptions', () => {
        it('should use custom selectOptions when provided', () => {
            const customOptions = [
                { label: 'Custom Option 1', value: 'custom1' },
                { label: 'Custom Option 2', value: 'custom2' },
            ];

            render(
                <SendCheckSelect
                    {...defaultProps}
                    selectOptions={customOptions}
                />
            );

            const select = screen.getByTestId('send-check-select');
            expect(select).toBeInTheDocument();
        });
    });
});
