'use client';

import { useQuery } from '@tanstack/react-query';
import { FundAccountTypeEnum } from '@zinnia/api-types/types/funds';
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

import { getPolicyFunds } from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { formatUSDollars } from '@/utils/currency';
import { percentFormatify } from '@/utils/numbers';

import { FundNameCellContent } from './FundNameCellContent';
import styles from './FundsTable.module.css';
import { LabelPopover } from '../label-popover/LabelPopover';
import { NoDataAvailable } from '../no-data-available/NoDataAvailable';

const FUND_VALUE_LABEL = 'fund value';
const INTEREST_RATE_LABEL = 'interest rate';
const NEXT_SWEEP_DATE_LABEL = 'next sweep date';

export const HoldingFunds = ({
  planCode,
  policyNumber,
}: {
  planCode: string;
  policyNumber: string;
}) => {
  const { width } = useWindowSize();

  const isDesktop = width >= 767;

  const { data: fundsData } = useQuery({
    queryKey: [QueryKeys.POLICY_FUNDS],
    queryFn: () => getPolicyFunds(planCode, policyNumber),
    select: data =>
      data?.filter(
        fund => fund.fundAccountType === FundAccountTypeEnum.HOLDING
      ),
  });

  if (!fundsData || fundsData.length === 0) {
    return <NoDataAvailable />;
  }

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
        {fundsData?.map(fund => (
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
