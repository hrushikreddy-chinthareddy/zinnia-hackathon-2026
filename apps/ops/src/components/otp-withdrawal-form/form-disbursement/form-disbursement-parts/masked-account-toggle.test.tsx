import { render, fireEvent } from '@testing-library/react';

import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';

import BankInformationContainer, { BankInfoType } from './masked-account-toggle';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));
afterEach(() => {
    jest.clearAllMocks();
});

// Mocking IBankInformationContainerProps
const mockProps = {
    children: <div>Test Children</div>,
    isMaskedBankInfoSupport: true,
    selectedBankInfoOption: BankInfoType.Full,
    maskedAccountNumber: '123456',
    setDisbursementInformation: jest.fn(),
};

describe('BankInformationContainer', () => {
    it('renders children when isMaskedBankInfo and selectedBankInfoOption is full', () => {
        const { getByText } = render(<BankInformationContainer {...mockProps} />);
        expect(getByText('Test Children')).toBeInTheDocument();
    });

    it('renders children when isMaskedBankInfo and selectedBankInfoOption is masked', () => {
        const { getByText } = render(<BankInformationContainer {...mockProps} selectedBankInfoOption={BankInfoType.Masked} />);
        expect(getByText('bankAccountEndingIn')).toBeInTheDocument();
    });

    it('renders children when isMaskedBankInfo is false', () => {
        const { getByText } = render(<BankInformationContainer {...mockProps} />);
        expect(getByText('Test Children')).toBeInTheDocument();
    });

    it('sets bankInfoType to full correctly when toggling ButtonGrp', () => {
        const prevSignatureState = { test: 'test' };
        let nextState;
        const mockSetter = jest.fn().mockImplementation(callback => {
            nextState = callback(prevSignatureState);
        });

        const { getByText } = render(<BankInformationContainer {...mockProps} setDisbursementInformation={mockSetter} />);
        fireEvent.click(getByText('fullBankInfo')); // Replace 'Button Label' with the actual label

        expect(nextState).toEqual({
            test: 'test',
            isDirectDeposit: true,
        });
    });

    it('sets bankInfoType to masked correctly when toggling ButtonGrp', () => {
        const prevSignatureState = { test: 'test' };
        let nextState;
        const mockSetter = jest.fn().mockImplementation(callback => {
            nextState = callback(prevSignatureState);
        });

        const { getByText } = render(<BankInformationContainer {...mockProps} setDisbursementInformation={mockSetter} />);
        fireEvent.click(getByText('maskedBankInfo')); // Replace 'Button Label' with the actual label

        expect(nextState).toEqual({
            test: 'test',
            isDirectDeposit: false,
        });
    });
});
