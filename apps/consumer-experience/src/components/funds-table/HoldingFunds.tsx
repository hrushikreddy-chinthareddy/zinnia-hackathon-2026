import {
  Label,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@zinnia/bloom/components';
import { DEFAULT_ERROR_STRING, toTitleCase } from '@zinnia/utils';
import dayjs from 'dayjs';

import { formatUSDollars } from '@/utils/currency';
import { DEFAULT_DATE_FORMAT } from '@/utils/dates';
import { percentFormatify } from '@/utils/numbers';

import { FundNameCellContent } from './FundNameCellContent';
import { LabelPopover } from '../label-popover/LabelPopover';

const fundsTableData = [
  {
    fundId: 'ELH001',
    fundAccountType: 'HOLDING',
    fundAccountName: 'Everly Holding IUL Fund',
    isElected: false,
    totalFundValue: 112, // i think null rather than 0 here?
    allocationPercentage: null, // i think null rather than 0 here?
    sweepDay: 15,
    fundSegments: null,
    minimumTransferAmount: 10.0,
    rateEffectiveDate: '2024-07-26',
    rateStartDate: '2024-07-26',
    bonusPeriodFrequency: 0,
    interestRate: 5.4,
    guaranteedMinimumInterestRate: 1.0,
  },
];

const FUND_VALUE_LABEL = 'fund value';
const INTEREST_RATE_LABEL = 'interest rate';
const NEXT_SWEEP_DATE_LABEL = 'next sweep date';

const getSweepDate = (sweepDay?: number | null) => {
  if (!sweepDay) {
    return DEFAULT_ERROR_STRING;
  }
  const today = dayjs();
  const sweepDate =
    today.day() > sweepDay
      ? today.add(1, 'month').date(sweepDay)
      : today.date(sweepDay);

  return sweepDate.format(DEFAULT_DATE_FORMAT);
};

export const HoldingFunds = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>
            <Label>{toTitleCase('fund name')}</Label>
          </TableHeaderCell>
          <TableHeaderCell>
            <Label
              interactiveElements={[
                <LabelPopover
                  key={INTEREST_RATE_LABEL}
                  title={INTEREST_RATE_LABEL}
                  content="This is the amount of your account value currently invested in this specific fund."
                />,
              ]}
            >
              {toTitleCase(INTEREST_RATE_LABEL)}
            </Label>
          </TableHeaderCell>
          <TableHeaderCell>
            <Label
              interactiveElements={[
                <LabelPopover
                  key={FUND_VALUE_LABEL}
                  title={FUND_VALUE_LABEL}
                  content="This is the amount of your account value currently invested in this specific fund."
                />,
              ]}
            >
              {toTitleCase(FUND_VALUE_LABEL)}
            </Label>
          </TableHeaderCell>
          <TableHeaderCell>
            <Label
              interactiveElements={[
                <LabelPopover
                  key={NEXT_SWEEP_DATE_LABEL}
                  title={NEXT_SWEEP_DATE_LABEL}
                  content="This is the amount of your account value currently invested in this specific fund."
                />,
              ]}
            >
              {toTitleCase(NEXT_SWEEP_DATE_LABEL)}
            </Label>
          </TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fundsTableData.map(fund => (
          <TableRow key={fund.fundId}>
            <TableCell className="typography-content-body-sm">
              <FundNameCellContent
                fundName={fund.fundAccountName}
                isElected={fund.isElected}
              />
            </TableCell>
            <TableCell className="typography-content-body-sm">
              {percentFormatify(fund.interestRate, {
                isInteger: true,
                displayNullAsZero: true,
              })}
            </TableCell>
            <TableCell className="typography-content-body-sm">
              {formatUSDollars(fund.totalFundValue, true, true)}
            </TableCell>
            <TableCell className="typography-content-body-sm">
              {getSweepDate(fund.sweepDay)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
