import { render, screen, fireEvent } from '@testing-library/react';

import { NonFinancialTransactions } from '@deps/queries/api/bpm-non-financial';

import BpmErrorState from './bpm-error-state';

// Mocks for all external components and icons
jest.mock('@deps/components/card/card-info/card-info', () => ({
    __esModule: true,
    default: ({ title, subtitle }: any) => (
        <div data-testid="mock-cardinfo">
            <div>{title}</div>
            <div>{subtitle}</div>
        </div>
    ),
}));
jest.mock('@deps/components/banner-alert/banner-alert', () => ({
    __esModule: true,
    default: ({ children }: any) => (
        <div data-testid="mock-banneralert">{children}</div>
    ),
    BannerVariant: { Error: 'Error' },
}));
jest.mock('@deps/components/checkbox/checkbox-text/checkbox-text', () => ({
    __esModule: true,
    default: ({ checked, onChange, label, assistiveText }: any) => (
        <div data-testid="mock-checkbox" onClick={onChange}>
            <span>{label}</span>
            <span>{checked ? 'checked' : 'unchecked'}</span>
            {assistiveText && <span>{assistiveText.text}</span>}
        </div>
    ),
}));
jest.mock('@deps/components/transaction-cta/transaction-cta', () => ({
    __esModule: true,
    default: ({ mainCta, secondaryCta, stopLoading }: any) => (
        <div data-testid="mock-cta">
            <button
                onClick={mainCta.onClick}
                disabled={!stopLoading}
                data-testid="main-cta"
            >
                {mainCta.text}
            </button>
            <button onClick={secondaryCta.onClick} data-testid="secondary-cta">
                {secondaryCta.text}
            </button>
        </div>
    ),
}));
jest.mock('@deps/components/nav-element/nav-element', () => ({
    __esModule: true,
    default: ({ onClick, children }: any) => (
        <button data-testid="mock-edit-btn" onClick={onClick}>
            {children}
        </button>
    ),
    NavElementSize: { Small: 'Small' },
    NavElementType: { Button: 'Button' },
    NavElementVariant: { Default: 'Default' },
}));

// Mock useTranslation
jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (str: string, opts?: any) => {
            if (opts && opts.transaction) return `edit ${opts.transaction}`;
            if (str === 'nigo') return 'NIGO';
            if (str === 'cta') return 'Continue';
            if (str === 'secondaryCta') return 'Cancel';
            if (str === 'subtitle') return 'Subtitle';
            if (str === 'title') return 'Title';
            if (str === 'nigoAssistive') return 'Please check NIGO';
            return str;
        },
    }),
}));

const defaultProps = {
    children: <div data-testid="child">Child Content</div>,
    onCancel: jest.fn(),
    onContinue: jest.fn(),
    setViewState: jest.fn(),
    transaction: NonFinancialTransactions.Address,
    validationResults: undefined,
};

describe('BpmErrorState', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with required props and children', () => {
        render(<BpmErrorState {...defaultProps} />);
        expect(screen.getByTestId('mock-cardinfo')).toBeInTheDocument();
        expect(screen.getByTestId('child')).toBeInTheDocument();
        expect(screen.getByTestId('mock-checkbox')).toBeInTheDocument();
        expect(screen.getByTestId('mock-cta')).toBeInTheDocument();
        expect(screen.getByTestId('mock-edit-btn')).toBeInTheDocument();
    });

    it('renders error banners when validationResults are provided', () => {
        const validationResults = [
            {
                attribute: null,
                error: 'Error1',
                errorCode: 'E1',
                resolution: 'Resolution1',
            },
            {
                attribute: null,
                error: 'Error2',
                errorCode: 'E2',
                resolution: 'Resolution2',
            },
        ];
        render(
            <BpmErrorState
                {...defaultProps}
                validationResults={validationResults}
            />
        );
        const banners = screen.getAllByTestId('mock-banneralert');
        expect(banners).toHaveLength(2);
        expect(banners[0]).toHaveTextContent('Error1');
        expect(banners[1]).toHaveTextContent('Error2');
    });

    it('calls setViewState when edit button is clicked', () => {
        render(<BpmErrorState {...defaultProps} />);
        fireEvent.click(screen.getByTestId('mock-edit-btn'));
        expect(defaultProps.setViewState).toHaveBeenCalledWith(
            expect.anything()
        );
    });

    it('shows assistive text if main CTA clicked without checking NIGO', () => {
        render(<BpmErrorState {...defaultProps} />);
        fireEvent.click(screen.getByTestId('main-cta'));
        expect(screen.getByText('Please check NIGO')).toBeInTheDocument();
        expect(defaultProps.onContinue).not.toHaveBeenCalled();
    });

    it('calls onContinue if main CTA clicked after checking NIGO', () => {
        render(<BpmErrorState {...defaultProps} />);
        fireEvent.click(screen.getByTestId('mock-checkbox'));
        fireEvent.click(screen.getByTestId('main-cta'));
        expect(defaultProps.onContinue).toHaveBeenCalled();
    });

    it('calls onCancel if secondary CTA is clicked', () => {
        render(<BpmErrorState {...defaultProps} />);
        fireEvent.click(screen.getByTestId('secondary-cta'));
        expect(defaultProps.onCancel).toHaveBeenCalled();
    });
});
