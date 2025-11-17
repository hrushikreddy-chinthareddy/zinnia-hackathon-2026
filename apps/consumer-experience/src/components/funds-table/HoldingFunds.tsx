'use client';

import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import {
  Label,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@zinnia/bloom/components';
import { useWindowSize } from 'react-use';

import { Fund } from '@/services/funds/types';
import { formatUSDollars } from '@/utils/currency';
import { percentFormatify } from '@/utils/numbers';
import { toSentenceCase } from '@/utils/strings';

import { FundNameCellContent } from './FundNameCellContent';
import styles from './FundsTable.module.css';
import { LoadingRow } from './LoadingRow';
import { allocationAccountInfo, sweepDateInfo } from './utils';
import { LabelPopover } from '../label-popover/LabelPopover';
import { NoDataAvailable } from '../no-data-available/NoDataAvailable';

const FUND_VALUE_LABEL = 'value';
const INTEREST_RATE_LABEL = 'interest rate';
const NEXT_SWEEP_DATE_LABEL = 'next sweep date';

// All columns are only shown at this size or higher
const SHOW_ALL_HOLDING_FUNDS_DETAILS_WIDTH = 767;

export const HoldingFunds = ({
  funds,
  isLoading,
  lineOfBusiness,
}: {
  funds?: Fund[];
  isLoading?: boolean;
  lineOfBusiness?: LineOfBusiness;
}) => {
  const { width } = useWindowSize();

  // Because Next renders on the server first, we were getting hydration error from this switch because the react-use
  // library sets width and height to Infinity by default and if window is undefined (which it is on the server) the width
  // and height never get updated to actual browser window size. Fun!!
  const isDesktop =
    width !== Infinity && width >= SHOW_ALL_HOLDING_FUNDS_DETAILS_WIDTH;

  if ((!funds || funds.length === 0) && !isLoading) {
    return <NoDataAvailable correlationId={undefined} />;
  }

  return (
    <Table preventBackgroundHoverInteraction>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>
            <Label>{toSentenceCase('name')}</Label>
          </TableHeaderCell>
          {isDesktop && (
            <TableHeaderCell>
              <Label
                interactiveElements={[
                  <LabelPopover
                    key={INTEREST_RATE_LABEL}
                    title={INTEREST_RATE_LABEL}
                  >
                    <p>
                      This is the rate of growth being earned on the amount
                      within a fixed account or holding account.
                    </p>
                  </LabelPopover>,
                ]}
              >
                {toSentenceCase(INTEREST_RATE_LABEL)}
              </Label>
            </TableHeaderCell>
          )}
          <TableHeaderCell>
            <Label
              interactiveElements={[
                <LabelPopover key={FUND_VALUE_LABEL} title={FUND_VALUE_LABEL}>
                  {allocationAccountInfo(lineOfBusiness)}
                </LabelPopover>,
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
                  >
                    {sweepDateInfo(lineOfBusiness)}
                  </LabelPopover>,
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
                    lineOfBusiness={lineOfBusiness}
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
