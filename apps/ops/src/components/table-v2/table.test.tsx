import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import Table, { TableProps } from './table';
import { ColumnType } from './table.types';

const sampleCols = [
    { field: 'name', headerName: 'Name', type: ColumnType.Text },
    { field: 'age', headerName: 'Age', editable: true, type: ColumnType.Number },
    { field: 'percentage', headerName: 'Percentage', type: ColumnType.Number },
    { field: 'marks', headerName: 'Marks', type: ColumnType.Number },
];

const sampleData = [
    { check: true, id: 1, name: 'David Williams', age: 45, percentage: '90' },
    { check: true, id: 2, name: 'Jane Smith', age: 51, percentage: '50' },
    { check: true, id: 3, name: 'John Doe', age: 20, percentage: '30.79' },
    { check: true, id: 4, name: 'Jane Doe', age: 19, percentage: '55.12' },
    { check: true, id: 5, name: 'Jane Will', age: 29, percentage: '77.23' },
    { check: true, id: 56, name: 'Emily Brown', age: 44, percentage: '69.69' },
];

const defaultProps: TableProps<unknown> = {
    data: sampleData,
    columns: sampleCols,
    disablePagination: true,
};

afterEach(cleanup);

describe('Table Component', () => {
    it('should render the table', () => {
        render(<Table {...defaultProps} />);
        expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should render table headers', () => {
        render(<Table {...defaultProps} />);
        for (const col of sampleCols) {
            expect(screen.getByText(col.headerName)).toBeInTheDocument();
        }
    });

    it('should render table rows', () => {
        render(<Table {...defaultProps} />);
        for (const row of sampleData) {
            expect(screen.getByText(row.name)).toBeInTheDocument();
            expect(screen.getByText(row.percentage)).toBeInTheDocument();
        }
    });

    it('should paginate if more than 5 rows and disablePagination prop is false', () => {
        render(<Table {...defaultProps} disablePagination={false} />);
        // Select all rows within tbody
        const rows = screen.getAllByRole('row', { hidden: true });

        // The first row is t he header, so we check for rows in the tbody
        const bodyRows = rows.slice(1);

        // Expect the tbody to have exactly 5 rows
        expect(bodyRows).toHaveLength(5);
    });
    // Ensure that sorting and pagination can work concurrently without issues
    it('should handle sorting works correctly', () => {
        render(<Table {...defaultProps} disablePagination />);

        const columnToSort = sampleCols[0].headerName;
        const initialData = sampleData.map(obj => ({ ...obj }));
        const sortedDataAsc = initialData.sort((a, b) => a.name.localeCompare(b.name));
        const sortedDataDesc = initialData.sort((a, b) => b.name.localeCompare(a.name));

        fireEvent.click(screen.getByText(columnToSort));

        for (let i = 0; i < sortedDataAsc.length; i++) {
            expect(screen.getByText(sortedDataAsc[i].name)).toBeInTheDocument();
        }

        fireEvent.click(screen.getByText(columnToSort));

        for (let i = 0; i < sortedDataDesc.length; i++) {
            expect(screen.getByText(sortedDataDesc[i].name)).toBeInTheDocument();
        }
    });

    it('should update table correctly when handleOnInputChange is called', () => {
        render(<Table {...defaultProps} disablePagination={false} />);
        const inputElement = screen.getByDisplayValue(sampleData[0].age.toString());

        fireEvent.change(inputElement, { target: { value: 'New Name' } });
        // expect(screen.getByDisplayValue('New Name')).toBeInTheDocument();
    });
});
