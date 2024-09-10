import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';

import BenefitsTable from './benefits-table';

const rowData = [
    {
        period: '5 years',
        returnGuarRate: '',
        returnCurrRate: '',
        return0Prct: '$7000',
        return6Prct: '$8000',
        return12Prct: '$9000',
    },
    {
        period: '10 years',
        returnGuarRate: '',
        returnCurrRate: '',
        return0Prct: '$7000',
        return6Prct: '$8000',
        return12Prct: '$9000',
    },
];

const cols = [
    { headerName: 'Years', field: 'period', editable: false, cellClass: ['w-100', 'text-sm'] },
    { headerName: 'Guaranteed rate', field: 'returnGuarRate', editable: true, cellClass: ['w-100', 'text-sm'] },
    { headerName: 'Current rate', field: 'returnCurrRate', editable: true, cellClass: ['w-100', 'text-sm'] },
];

afterEach(cleanup);

describe('Table Component', () => {
    it('should render the table', () => {
        render(<BenefitsTable rowConfig={rowData} colConfig={cols} />);
        expect(screen.getByRole('treegrid')).toBeInTheDocument();
    });

    it('should render table headers', () => {
        render(<BenefitsTable rowConfig={rowData} colConfig={cols} />);
        for (const col of cols) {
            expect(screen.getByText(col.headerName)).toBeInTheDocument();
        }
    });

    it('should render table rows', () => {
        render(<BenefitsTable rowConfig={rowData} colConfig={cols} />);
        for (const row of rowData) {
            expect(screen.getByText(row.period)).toBeInTheDocument();
            expect(screen.getByText('Guaranteed rate')).toBeInTheDocument();
            expect(screen.getByText('Current rate')).toBeInTheDocument();
        }
    });

    it('should render table rows with initial data', () => {
        const initialData = [
            {
                period: "5 years",
                returnGuarRate: 88,
                returnCurrRate: 72,
                return0Prct: 11,
                return6Prct: 32,
                return12Prct: 45
            },
            {
                period: "10 years",
                returnGuarRate: 12,
                returnCurrRate: 33,
                return0Prct: 99,
                return6Prct: '28',
                return12Prct: 12
            }
        ];

        render(<BenefitsTable rowConfig={rowData} initialData={initialData} colConfig={cols} />);

        for (const _ of rowData) {
            expect(screen.getByText('Guaranteed rate')).toBeInTheDocument();
            expect(screen.getByText('Current rate')).toBeInTheDocument();
            expect(screen.getByText('88')).toBeInTheDocument();
            expect(screen.getByText('72')).toBeInTheDocument();
            expect(screen.getByText('12')).toBeInTheDocument();
            expect(screen.getByText('33')).toBeInTheDocument();
        }
    });
});
