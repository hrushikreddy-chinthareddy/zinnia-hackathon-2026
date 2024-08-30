'use client';

import {
  Label,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@zinnia/bloom/components';
import { toSentenceCase } from '@zinnia/utils';
import { useWindowSize } from 'react-use';

import { Fund } from '@/services/funds';
import { formatUSDollars } from '@/utils/currency';
import { percentFormatify } from '@/utils/numbers';

import { FundNameCellContent } from './FundNameCellContent';
import styles from './FundsTable.module.css';
import { LoadingRow } from './LoadingRow';
import { LabelPopover } from '../label-popover/LabelPopover';
import { NoDataAvailable } from '../no-data-available/NoDataAvailable';

const FUND_VALUE_LABEL = 'fund value';
const INTEREST_RATE_LABEL = 'interest rate';
const NEXT_SWEEP_DATE_LABEL = 'next sweep date';

// All columns are only shown at this size or higher
const SHOW_ALL_HOLDING_FUNDS_DETAILS_WIDTH = 767;

export const HoldingFunds = ({
  funds,
  isLoading,
}: {
  funds?: Fund[];
  isLoading?: boolean;
}) => {
  const { width } = useWindowSize();

  const isDesktop = width >= SHOW_ALL_HOLDING_FUNDS_DETAILS_WIDTH;

  if ((!funds || funds.length === 0) && !isLoading) {
    return <NoDataAvailable />;
  }

  return (
    <Table preventBackgroundHoverInteraction>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>
            <Label>{toSentenceCase('fund name')}</Label>
          </TableHeaderCell>
          {isDesktop && (
            <TableHeaderCell>
              <Label
                interactiveElements={[
                  <LabelPopover
                    key={INTEREST_RATE_LABEL}
                    title={INTEREST_RATE_LABEL}
                    content="This is the rate of growth being earned on the amount invested within a fixed fund or holding fund."
                  />,
                ]}
              >
                {toSentenceCase(INTEREST_RATE_LABEL)}
              </Label>
            </TableHeaderCell>
          )}
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
              {toSentenceCase(FUND_VALUE_LABEL)}
            </Label>
          </TableHeaderCell>
          {isDesktop && (
            <TableHeaderCell>
              <Label
                interactiveElements={[
                  <LabelPopover
                    key={NEXT_SWEEP_DATE_LABEL}
                    title={NEXT_SWEEP_DATE_LABEL}
                    content="On this date, all money in the holding fund will be “swept” or moved into the policy’s various funds, according to your elected fund allocations. In most cases, the sweep date happens on the same date every month."
                  />,
                ]}
              >
                {toSentenceCase(NEXT_SWEEP_DATE_LABEL)}
              </Label>
            </TableHeaderCell>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        <>
          {isLoading && <LoadingRow cellCount={isDesktop ? 4 : 2} />}

          {funds?.map(fund => {
            if (!fund || !fund.fundName) {
              return null;
            }
            return (
              <TableRow key={fund.fundId} className={styles.tableRow}>
                <TableCell className="typography-content-body-sm">
                  <FundNameCellContent
                    isElected={fund.isElected}
                    fundDetails={fund}
                  />
                </TableCell>
                {isDesktop && (
                  <TableCell className="typography-content-body-sm">
                    {percentFormatify(fund.interestRate, {
                      isInteger: true,
                      displayNullAsZero: true,
                    })}
                  </TableCell>
                )}
                <TableCell className="typography-content-body-sm">
                  {formatUSDollars(fund.totalFundValue, true, true)}
                </TableCell>
                {isDesktop && (
                  <TableCell className="typography-content-body-sm">
                    {fund.sweepDate}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </>
      </TableBody>
    </Table>
  );
};
