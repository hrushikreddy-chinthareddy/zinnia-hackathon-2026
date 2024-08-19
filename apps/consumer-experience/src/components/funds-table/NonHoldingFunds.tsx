import {
  Label,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@zinnia/bloom/components';
import clsx from 'clsx';

import { formatUSDollars } from '@/utils/currency';
import { percentFormatify } from '@/utils/numbers';

import { FundNameCellContent } from './FundNameCellContent';
import { LabelPopover } from '../label-popover/LabelPopover';

const fundsTableData = [
  {
    fundId: 'ELF001',
    isElected: true, // - i think we should explicitly say "isElected" rather than relying on the frontend
    // knowing they have to check to see if there's an allocation value...
    totalFundValue: 183.72,
    allocationPercentage: 50,
    fundAccountType: 'FIXED',
    fundAccountName: 'Everly IUL Fixed Fund',
    minimumTransferAmount: 10.0,
    rateEffectiveDate: '2024-07-26',
    rateStartDate: '2024-07-26',
    sweepDay: null,
    bonusPeriodFrequency: 0,
    interestRate: 5.4,
    guaranteedMinimumInterestRate: 1.0,
    fundSegments: [
      {
        segmentId: '1',
        fundId: 'ELF001',
        originalDepositAmount: 42.47,
        originalDepositDate: '2024-06-15',
        depositDate: '2024-06-15',
        depositAmount: 42.47,
        currentAmount: 368.01,
        renewalDate: '2025-06-01',
        numberOfUnits: null,
        sweepAccountId: null,
        startDate: '2024-06-01',
        endDate: null,
        interestEarningAmount: 85.51,
        startingPrice: 5.4,
        startingPriceDate: '2024-06-01',
        endingPrice: 0,
        endingPriceDate: '2025-06-01',
      },
    ],
  },
  {
    fundId: 'ELF002',
    fundAccountType: 'INDEXED',
    isElected: false,
    totalFundValue: null, // i think null rather than 0 here?
    allocationPercentage: null, // i think null rather than 0 here?
    sweepDay: null,
    fundSegments: null,
    fundAccountName:
      'S&P 500® Price Return Annual Point-to-Point with Participation Rate Account',
    minimumTransferAmount: 10.0,
    rateEffectiveDate: '2024-08-15',
    rateStartDate: '2024-07-26',
    index: 'S&P 500®',
    interestRate: 4.0,
    guaranteedMinimumInterestRate: 1.0,
    maximumIllustrativeInterestRate: 5.0,
  },
];

export const NonHoldingFunds = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {/* TODO: update these values when mobile */}
          <TableHeaderCell>
            <Label>Fund Name</Label>
          </TableHeaderCell>
          <TableHeaderCell>
            <Label
              interactiveElements={[
                <LabelPopover
                  key="Fund Value"
                  title="Fund Value"
                  content="This is the amount of your account value currently invested in this specific fund."
                />,
              ]}
            >
              Fund Value
            </Label>
          </TableHeaderCell>
          <TableHeaderCell>
            <Label>Allocation</Label>
          </TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fundsTableData.map(fund => (
          <TableRow key={fund.fundId} className="typography-content-body-sm">
            <TableCell>
              <FundNameCellContent
                fundName={fund.fundAccountName}
                isElected={fund.isElected}
              />
            </TableCell>
            <TableCell
              className={clsx({
                'typography-content-body-sm-bold': !!fund.totalFundValue,
              })}
            >
              {formatUSDollars(fund.totalFundValue, true, true)}
            </TableCell>
            <TableCell
              className={clsx({
                'typography-content-body-sm-bold': !!fund.allocationPercentage,
              })}
            >
              {percentFormatify(fund.allocationPercentage, {
                isInteger: true,
                displayNullAsZero: true,
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
