import { render, screen } from '@testing-library/react';

import SevenPayCard from './seven-pay-card';

const testValues = {
    modifiedEndowmentContract: {
        amountExcessToGuideline: 0,
        amountExcessToModifiedEndowmentContract: 0,
        definitionOfLifeInsurance: 'GPT',
        guidelineLevelPremium: 5000,
        guidelinePremiumTestDate: '2023-12-23',
        guidelineSinglePremium: 70000,
        modifiedEndowmentContractStatus: false,
        modifiedEndowmentContractStatusDate: undefined,
        modifiedEndowmentContractTestDate: '2023-12-23',
        sevenPayLimit: 30000,
        sevenPayPeriod: '2030-08-22',
        sevenPayPremium: 20000,
        sevenPayStartDate: '2023-08-23',
        sevenPayTestBasis: 1000,
        totalGuidelineLevelPremiumSinceIssue: 5000,
        yearInPeriod: 1,
    },
};

describe('SevenPayCard', () => {
    test('renders the component with correct copy and values when not mec', () => {
        render(<SevenPayCard testValues={testValues} />);

        expect(screen.getByText('title')).toBeInTheDocument();
        expect(screen.getByText('isNotMec')).toBeInTheDocument();

        expect(screen.getByText('amountRemaining')).toBeInTheDocument();
        expect(screen.getByText('$29,000.00')).toBeInTheDocument();

        expect(screen.getByText('Basis')).toBeInTheDocument();
        expect(screen.getByText('$1,000.00')).toBeInTheDocument();

        expect(screen.getByText('Totallimit')).toBeInTheDocument();
        expect(screen.getByText('$30,000.00')).toBeInTheDocument();

        expect(screen.getByText('Testperiod')).toBeInTheDocument();
        expect(screen.getByText('8/23/2023 - 8/22/2030')).toBeInTheDocument();
        expect(screen.getByText('testPeriodCaption')).toBeInTheDocument();

        expect(screen.getByText('Annualpremium')).toBeInTheDocument();
        expect(screen.getByText('$20,000.00')).toBeInTheDocument();
    });

    test('renders the component with correct copy and values when mec', () => {
        const mecTestValues = {
            ...testValues,
            modifiedEndowmentContract: {
                ...testValues.modifiedEndowmentContract,
                modifiedEndowmentContractStatus: true,
                sevenPayTestBasis: 40000,
            },
        };

        render(<SevenPayCard testValues={mecTestValues} />);

        expect(screen.getByText('title')).toBeInTheDocument();
        expect(screen.getByText('isMec')).toBeInTheDocument();

        expect(screen.getByText('amountExcessMec')).toBeInTheDocument();
        expect(screen.getByText('$10,000.00')).toBeInTheDocument();

        expect(screen.getByText('Basis')).toBeInTheDocument();
        expect(screen.getByText('$40,000.00')).toBeInTheDocument();

        expect(screen.getByText('Totallimit')).toBeInTheDocument();
        expect(screen.getByText('$30,000.00')).toBeInTheDocument();
    });

    test('renders the component with inactive card when seven pay perios has passed', () => {
        const inactiveTestValues = {
            ...testValues,
            modifiedEndowmentContract: {
                ...testValues.modifiedEndowmentContract,
                sevenPayPeriod: '2023-08-23',
            },
        };

        render(<SevenPayCard testValues={inactiveTestValues} />);

        expect(screen.getByText('inactiveTitle')).toBeInTheDocument();

        expect(screen.getByText(/inactiveStartText/)).toBeInTheDocument();
        expect(screen.getByText(/8\/23\/2023/)).toBeInTheDocument();
        expect(screen.getByText(/inactiveEndText/)).toBeInTheDocument();
    });
});
