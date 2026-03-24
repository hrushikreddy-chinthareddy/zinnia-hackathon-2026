import { Meta } from '@storybook/react';

import Table, { TableProps } from './table';
import '@deps/styles/styles.css';

export default {
    title: 'Components/Table',
    component: Table,
    decorators: [
        (Story) => (
            <div className="h-screen bg-background p-10">
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/ag-grid-community@31.3.4/styles/ag-grid.css"
                />
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/ag-grid-community@31.3.4/styles/ag-theme-alpine.css"
                />
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
    { headerName: 'Name', field: 'name', sortable: true, filter: true },
    { headerName: 'Age', field: 'age', sortable: true, filter: true },
    { headerName: 'Country', field: 'country', sortable: true, filter: true },
];

const sampleData = [
    { name: 'John', age: 28, country: 'US' },
    { name: 'Jane', age: 32, country: 'UK' },
    { name: 'Mark', age: 25, country: 'Canada' },
];

// Standard Table
export const StandardTable = (args: TableProps) => <Table {...args} />;
StandardTable.args = {
    rowData: sampleData,
    cols: sampleCols,
};
