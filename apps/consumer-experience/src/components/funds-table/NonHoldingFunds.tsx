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
import clsx from 'clsx';
import { useMemo } from 'react';
import { useWindowSize } from 'react-use';

import { getPolicyFunds } from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { formatUSDollars } from '@/utils/currency';
import { percentFormatify } from '@/utils/numbers';

import { FundNameCellContent } from './FundNameCellContent';
import styles from './FundsTable.module.css';
import { LabelPopover } from '../label-popover/LabelPopover';
import { NoDataAvailable } from '../no-data-available/NoDataAvailable';
import { sortNonHoldingFunds } from './utils';

export const NonHoldingFunds = ({
  policyNumber,
  planCode,
}: {
  planCode: string;
  policyNumber: string;
}) => {
  const { width } = useWindowSize();
  const { data: funds } = useQuery({
    queryKey: [QueryKeys.POLICY_FUNDS],
    queryFn: () => getPolicyFunds(planCode, policyNumber),
    select: data => {
      const nonHolding = data?.filter(
        fund => fund.fundAccountType !== FundAccountTypeEnum.HOLDING
      );

      return sortNonHoldingFunds(nonHolding);
    },
  });

  const headerVals = useMemo(() => {
    if (width > 500) {
      return {
        fundName: 'Fund Name',
        fundValue: 'Fund Value',
        allocation: 'Allocation',
      };
    }

    return {
      fundName: 'Fund',
      fundValue: 'Value',
      allocation: 'Alloc.',
    };
  }, [width]);

  if (!funds || funds.length === 0) {
    return <NoDataAvailable />;
  }

  const dataValueStyles = (val?: number | null) => {
    return clsx({
      'typography-content-body-sm-bold': !!val,
      [styles.activeFund as string]: !val,
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>
            <Label>{toSentenceCase(headerVals.fundName)}</Label>
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
              {toSentenceCase(headerVals.fundValue)}
            </Label>
          </TableHeaderCell>
          <TableHeaderCell>
            <Label>{toSentenceCase(headerVals.allocation)}</Label>
          </TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {funds.map(fund => (
          <TableRow
            key={fund.fundId}
            className={`typography-content-body-sm ${styles.tableRow}`}
          >
            <TableCell>
              <FundNameCellContent
                fundName={fund.fundName || ''}
                isElected={fund.isElected}
              />
            </TableCell>
            <TableCell className={dataValueStyles(fund.totalFundValue)}>
              {formatUSDollars(fund.totalFundValue, true, true)}
            </TableCell>
            <TableCell className={dataValueStyles(fund.allocationPercentage)}>
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
