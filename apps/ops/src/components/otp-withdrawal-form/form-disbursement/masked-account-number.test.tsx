import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';

import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';

import { MaskedAccountNumber } from './form-disbursement-parts/masked-account-number';
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

describe('MaskedAccountNumber', () => {
    const setDisbursementInformationMock = jest.fn();

    it('renders without errors', () => {
        render(<MaskedAccountNumber maskedAccountNumber="" setDisbursementInformation={setDisbursementInformationMock} />);
    });

    it('passes correct props to Content component', () => {
        const { getByText } = render(
            <MaskedAccountNumber maskedAccountNumber="" setDisbursementInformation={setDisbursementInformationMock} />
        );
        expect(getByText('bankAccountEndingIn')).toBeInTheDocument();
        expect(getByText('toProcessThisRequest')).toBeInTheDocument();
    });

    it('renders the component with a valid maskedAccountNumber', () => {
        const { getByRole } = render(
            <MaskedAccountNumber maskedAccountNumber="1234" setDisbursementInformation={setDisbursementInformationMock} />
        );
        const input = getByRole('textbox');
        expect(input).toHaveValue('1234');
    });

    it('updates maskedAccountNumber correctly', () => {
        const prevSignatureState = { maskedAccountNumber: null };
        let nextState;
        const mockSetter = jest.fn().mockImplementation(callback => {
            nextState = callback(prevSignatureState);
        });

        const { getByRole } = render(<MaskedAccountNumber maskedAccountNumber="" setDisbursementInformation={mockSetter} />);
        fireEvent.change(getByRole('textbox'), { target: { value: '1234' } });
        expect(nextState).toEqual({
            maskedAccountNumber: '1234',
        });
    });
});
