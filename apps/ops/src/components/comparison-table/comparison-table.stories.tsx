import { Meta } from '@storybook/react';
import React from 'react';

import ComparisonTable, { ComparisonTableProps } from './comparison-table';

export default {
    title: 'Components/Table/ComparisonTable',
    component: ComparisonTable,
    args: {
        comparisonData: [
            {
                header: '',
                new: 'New autopay details',
                current: 'Current',
            },
            {
                header: 'Amount',
                new: '$90.00',
                current: '$88.00',
            },
            {
                header: 'Frequency',
                new: 'Monthly',
                current: 'Annually',
            },
            {
                header: 'Next payment date',
                new: '02/28/2028',
                current: '01/28/2024',
            },
            {
                header: 'Payor',
                new: 'Johnathon Anderson Smithson',
                current: 'Flora Anderson',
            },
            {
                header: 'Banking details',
                new: {
                    paymentType: 'EFT',
                    branchName: 'C Bank',
                    accountNumber: '1234',
                },
                current: {
                    paymentType: 'EFT',
                    branchName: 'Citi Bank',
                    accountNumber: '1234',
                },
            },
        ],
    },
} as Meta<typeof ComparisonTable>;

export const Default = (args: ComparisonTableProps) => {
    return <ComparisonTable comparisonData={args.comparisonData} />;
};
