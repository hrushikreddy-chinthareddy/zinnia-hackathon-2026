import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';

import DepTable, { TableProps } from './table';

const sampleCols = [
    { headerName: 'Name', field: 'name', sortable: true, filter: true },
    { headerName: 'Age', field: 'age', sortable: true, filter: true },
    { headerName: 'Country', field: 'country', sortable: true, filter: true },
];

const sampleData = [
    { name: 'John', age: 28, country: 'US' },
    { name: 'Jane', age: 32, country: 'UK' },
    { name: 'Mark', age: 25, country: 'Canada' },
];

const defaultProps: TableProps = {
    rowData: sampleData,
    cols: sampleCols,
};

afterEach(cleanup);

describe('Table Component', () => {
    it('should render the table', () => {
        render(<DepTable {...defaultProps} />);
        expect(screen.getByRole('treegrid')).toBeInTheDocument();
    });

    it('should render table headers', () => {
        render(<DepTable {...defaultProps} />);
        for (const col of sampleCols) {
            expect(screen.getByText(col.headerName)).toBeInTheDocument();
        }
    });

    it('should render table rows', () => {
        render(<DepTable {...defaultProps} />);
        for (const row of sampleData) {
            expect(screen.getByText(row.name)).toBeInTheDocument();
            expect(screen.getByText(row.age.toString())).toBeInTheDocument();
            expect(screen.getByText(row.country)).toBeInTheDocument();
        }
    });
});
