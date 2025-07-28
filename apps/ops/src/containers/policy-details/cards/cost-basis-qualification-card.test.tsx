import '@testing-library/jest-dom';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';

import { CostBasisQualificationCard } from './cost-basis-qualification-card';

jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        pathname: '/',
    })),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                costBasisAndQualification: 'Cost basis and Qualification',
                costBasis: 'Cost basis',
                qualificationType: 'Qualification type',
                issueState: 'Issue state',
                showdetailedCostBasis: 'Show detailed cost basis info',
                preTefraBasis: 'Pre tefra basis',
                preTamraBasis: 'Pre tamra basis',
                postTamraBasis: 'Post tamra basis',
            };
            return translations[key] ?? key;
        },
    }),
}));

afterEach(cleanup);

const mockPolicy = {
    costBasis: 10000,
    issueState: 'CA',
    qualificationType: 'qualified',
    currency: 'USD',
    costBasisDetails: {
        preTaxEquityAndFiscalResponsibilityActBasis: 3000,
        preTechnicalAndMiscellaneousRevenueActAmount: 2000,
        postTechnicalAndMiscellaneousRevenueActAmount: 5000,
    },
};

describe('CostBasisQualificationCard', () => {
    it('should render basic fields', () => {
        render(<CostBasisQualificationCard policy={mockPolicy as any} />);

        expect(
            screen.getByText('Cost basis and Qualification')
        ).toBeInTheDocument();
        expect(screen.getByText('Cost basis')).toBeInTheDocument();
        expect(screen.getByText('$10,000.00')).toBeInTheDocument();
        expect(screen.getByText('Qualification type')).toBeInTheDocument();
        expect(screen.getByText('qualified')).toBeInTheDocument();
        expect(screen.getByText('Issue state')).toBeInTheDocument();
        expect(screen.getByText('California')).toBeInTheDocument();
    });

    it('should not show additional cost basis fields initially', () => {
        render(<CostBasisQualificationCard policy={mockPolicy as any} />);
        expect(screen.queryByText('Pre tefra basis')).not.toBeInTheDocument();
        expect(screen.queryByText('$3,000.00')).not.toBeInTheDocument();
    });

    it('should show additional cost basis fields when toggle is clicked', () => {
        render(<CostBasisQualificationCard policy={mockPolicy as any} />);
        const toggle = screen.getByTestId('cost-basis-toggle');
        fireEvent.click(toggle);

        expect(screen.getByText('Pre tefra basis')).toBeInTheDocument();
        expect(screen.getByText('$3,000.00')).toBeInTheDocument();
        expect(screen.getByText('Pre tamra basis')).toBeInTheDocument();
        expect(screen.getByText('$2,000.00')).toBeInTheDocument();
        expect(screen.getByText('Post tamra basis')).toBeInTheDocument();
        expect(screen.getByText('$5,000.00')).toBeInTheDocument();
    });

    it('should hide additional fields when toggled again', () => {
        render(<CostBasisQualificationCard policy={mockPolicy as any} />);
        const toggle = screen.getByTestId('cost-basis-toggle');
        fireEvent.click(toggle);
        fireEvent.click(toggle);

        expect(screen.queryByText('Pre tefra basis')).not.toBeInTheDocument();
        expect(screen.queryByText('$3,000.00')).not.toBeInTheDocument();
    });
});
