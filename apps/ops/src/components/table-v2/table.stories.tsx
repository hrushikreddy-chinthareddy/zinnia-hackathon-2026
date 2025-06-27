import { Meta } from '@storybook/react';

import '@deps/styles/styles.css';
import Table, { TableProps } from './table';
import { ColumnType } from './table.types';

export default {
    title: 'Components/Table-v2',
    component: Table,
    decorators: [
        (Story) => (
            <div className="h-screen bg-background p-10">
                <Story />
            </div>
        ),
    ],
    argTypes: {
        hideHeader: {
            control: 'boolean',
        },
    },
} as Meta<typeof Table>;

const sampleCols = [
    { field: 'check', headerName: '', type: ColumnType.Boolean, width: '10%' },
    {
        field: 'name',
        headerName: 'Name',
        sortable: true,
        type: ColumnType.Text,
    },
    {
        field: 'age',
        headerName: 'Age',
        editable: true,
        type: ColumnType.Number,
    },
    { field: 'percentage', headerName: 'Percentage', type: ColumnType.Number },
    { field: 'marks', headerName: 'Marks', type: ColumnType.Number },
];

const sampleData = [
    { check: true, id: 1, name: 'David Williams', age: 45, percentage: '90' },
    { check: true, id: 2, name: 'Jane Smith', age: 51, percentage: '90' },
    { check: true, id: 3, name: 'John Doe', age: 20, percentage: '90' },
    { check: true, id: 4, name: 'Jane Smith', age: 19, percentage: '90' },
    { check: true, id: 5, name: 'Jane Smith', age: 29, percentage: '90' },
    { check: true, id: 6, name: 'Matthew Anderson', age: 43, percentage: '90' },
    { check: true, id: 7, name: 'Emily Brown', age: 18, percentage: '90' },
    { check: true, id: 8, name: 'Sophia Garcia', age: 22, percentage: '90' },
    { check: true, id: 9, name: 'David Williams', age: 48, percentage: '90' },
    { check: true, id: 10, name: 'Sophia Garcia', age: 38, percentage: '90' },
    { check: true, id: 11, name: 'Sophia Garcia', age: 26, percentage: '90' },
    { check: true, id: 12, name: 'Michael Johnson', age: 37, percentage: '90' },
    { check: true, id: 13, name: 'Olivia Martinez', age: 43, percentage: '90' },
    { check: true, id: 14, name: 'Michael Johnson', age: 22, percentage: '90' },
    { check: true, id: 15, name: 'Sophia Garcia', age: 56, percentage: '90' },
    { check: true, id: 16, name: 'Emily Brown', age: 47, percentage: '90' },
    { check: true, id: 17, name: 'David Williams', age: 43, percentage: '90' },
    { check: true, id: 18, name: 'David Williams', age: 25, percentage: '90' },
    { check: true, id: 19, name: 'Sophia Garcia', age: 28, percentage: '90' },
    { check: true, id: 20, name: 'Michael Johnson', age: 45, percentage: '90' },
    { check: true, id: 21, name: 'Michael Johnson', age: 51, percentage: '90' },
    { check: true, id: 22, name: 'Jane Smith', age: 30, percentage: '90' },
    { check: true, id: 23, name: 'Sophia Garcia', age: 18, percentage: '90' },
    { check: true, id: 24, name: 'Daniel Taylor', age: 54, percentage: '90' },
    { check: true, id: 25, name: 'David Williams', age: 34, percentage: '90' },
    { check: true, id: 26, name: 'David Williams', age: 22, percentage: '90' },
    { check: true, id: 27, name: 'John Doe', age: 18, percentage: '90' },
    { check: true, id: 28, name: 'David Williams', age: 39, percentage: '90' },
    { check: true, id: 29, name: 'Daniel Taylor', age: 38, percentage: '90' },
    { check: true, id: 30, name: 'Olivia Martinez', age: 30, percentage: '90' },
    {
        check: true,
        id: 31,
        name: 'Matthew Anderson',
        age: 25,
        percentage: '90',
    },
    { check: true, id: 32, name: 'David Williams', age: 42, percentage: '90' },
    { check: true, id: 33, name: 'Olivia Martinez', age: 34, percentage: '90' },
    { check: true, id: 34, name: 'Olivia Martinez', age: 53, percentage: '90' },
    { check: true, id: 35, name: 'Emily Brown', age: 35, percentage: '90' },
    {
        check: true,
        id: 36,
        name: 'Matthew Anderson',
        age: 31,
        percentage: '90',
    },
    { check: true, id: 37, name: 'Daniel Taylor', age: 51, percentage: '90' },
    { check: true, id: 38, name: 'Michael Johnson', age: 32, percentage: '90' },
    { check: true, id: 39, name: 'Jane Smith', age: 41, percentage: '90' },
    { check: true, id: 40, name: 'John Doe', age: 31, percentage: '90' },
    { check: true, id: 41, name: 'Daniel Taylor', age: 36, percentage: '90' },
    { check: true, id: 42, name: 'Jane Smith', age: 45, percentage: '90' },
    { check: true, id: 43, name: 'Michael Johnson', age: 42, percentage: '90' },
    {
        check: true,
        id: 44,
        name: 'Matthew Anderson',
        age: 55,
        percentage: '90',
    },
    { check: true, id: 45, name: 'Olivia Martinez', age: 52, percentage: '90' },
    { check: true, id: 46, name: 'John Doe', age: 35, percentage: '90' },
    { check: true, id: 47, name: 'Sophia Garcia', age: 47, percentage: '90' },
    { check: true, id: 48, name: 'Michael Johnson', age: 40, percentage: '90' },
    { check: true, id: 49, name: 'Sophia Garcia', age: 54, percentage: '90' },
    { check: true, id: 50, name: 'Emily Brown', age: 44, percentage: '90' },
    { check: true, id: 51, name: 'Sophia Garcia', age: 54, percentage: '90' },
    { check: true, id: 52, name: 'Emily Brown', age: 44, percentage: '90' },
    { check: true, id: 53, name: 'Sophia Garcia', age: 54, percentage: '90' },
    { check: true, id: 54, name: 'Emily Brown', age: 44, percentage: '90' },
    { check: true, id: 55, name: 'Sophia Garcia', age: 54, percentage: '90' },
    { check: true, id: 56, name: 'Emily Brown', age: 44, percentage: '90' },
];

// Standard Table
export const StandardTable = (args: TableProps<unknown>) => <Table {...args} />;
StandardTable.args = {
    data: sampleData,
    columns: sampleCols,
};
