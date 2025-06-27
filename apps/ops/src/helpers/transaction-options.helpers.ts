export interface TransactionOption {
    label: string;
    value: string;
    leading?: string;
    trailing?: string;
}

export const transactionOptions: TransactionOption[] = [
    { label: 'NONE', value: '-1' },
    { label: 'Auto', value: '0' },
    { label: 'Dollar', value: '1', leading: '$' },
    { label: 'Percentage', value: '2', trailing: '%' },
    { label: 'Units', value: '3' },
    { label: 'Prorata', value: '4' },
    { label: 'Maximum', value: '5' },
    { label: 'Maintain Face', value: '6' },
    { label: 'Adjust Face', value: '7' },
    { label: 'New Amount', value: '8' },
    { label: 'Face Change', value: '9' },
    { label: 'Non-Financial', value: '10' },
    { label: 'Maximum Free', value: '11' },
    { label: 'Combo', value: '12' },
    { label: '% of A.V.', value: '13' },
    { label: 'Prorata (Variable)', value: '14' },
    { label: 'Earnings Only', value: '15' },
    { label: 'Reserve Adjustment', value: '16' },
    { label: 'Partial Rebalance', value: '17' },
    { label: 'Dollar Liquidity First', value: '18' },
    { label: 'Dollar Liquidity Last', value: '19' },
    { label: 'Total Free Withdrawal', value: '20' },
    { label: 'Choice Dollar', value: '21' },
    { label: 'Choice Max Free', value: '22' },
    { label: 'Earnings Liquidity First', value: '23' },
    { label: 'Earnings Liquidity Last', value: '24' },
    { label: 'Percent Liquidity First', value: '25' },
    { label: 'Percent Liquidity Last', value: '26' },
    { label: 'Bonus Dollar', value: '27' },
    { label: 'Bonus Percentage', value: '28' },
    { label: 'Prorata (Fixed) then Variable', value: '29' },
    { label: 'Prorata (All)', value: '30' },
    { label: 'Single GMWB', value: '31' },
    { label: 'Joint GMWB', value: '32' },
    { label: 'Pecking Order', value: '33' },
    { label: 'Div Request', value: '34' },
    { label: 'No Cont Val Reduct', value: '35' },
    { label: 'GMWB Annual Limit', value: '36' },
    { label: 'Primary', value: '37' },
    { label: 'Joint', value: '38' },
    { label: 'GMWB Recalc Annual Limit', value: '39' },
    { label: 'Bailout Only', value: '40' },
    { label: 'Window Period Only', value: '41' },
    { label: 'GMWB Annual/Pecking', value: '42' },
    { label: 'GMWB Recalc/Pecking', value: '43' },
    { label: 'RIA Fee Percentage', value: '44' },
    { label: 'RIA Fee Dollar', value: '45' },
    { label: 'GMWB Annual Limit-Level', value: '46' },
    { label: 'GMWB AL-Level/Pecking', value: '47' },
    { label: 'Modified Earnings Only', value: '48' },
    { label: 'Spousal Default', value: '49' },
    { label: 'Fixed Modified Earnings', value: '50' },
    { label: 'Prorata New Money', value: '51' },
    { label: 'Accumulated Earnings', value: '52' },
    { label: 'ContractYear Earnings', value: '53' },
    { label: 'CalendarYear Earnings', value: '54' },
];

export enum TransactionTypes {
    Dollar = '1',
    Percentage = '2',
}

export const getTrasanctionsByIds = (ids: string[]): TransactionOption[] => {
    return transactionOptions.filter((transaction) =>
        ids.includes(transaction.value)
    );
};
