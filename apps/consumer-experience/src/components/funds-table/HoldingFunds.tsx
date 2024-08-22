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
import { LabelPopover } from '../label-popover/LabelPopover';

const FUND_VALUE_LABEL = 'fund value';
const INTEREST_RATE_LABEL = 'interest rate';
const NEXT_SWEEP_DATE_LABEL = 'next sweep date';

export const HoldingFunds = ({ funds }: { funds?: Fund[] }) => {
  const { width } = useWindowSize();

  const isDesktop = width >= 767;

  return (
    <Table>
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
                    content="This is the amount of your account value currently invested in this specific fund."
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
                    content="This is the amount of your account value currently invested in this specific fund."
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
        {funds?.map(fund => (
          <TableRow key={fund.fundId} className={styles.tableRow}>
            <TableCell className="typography-content-body-sm">
              <FundNameCellContent
                fundName={fund.fundName || ''}
                isElected={fund.isElected}
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
        ))}
      </TableBody>
    </Table>
  );
};
