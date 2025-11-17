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
import { toSentenceCase } from '@zinnia/xd-utils';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useWindowSize } from 'react-use';

import { Fund } from '@/services/funds/types';
import { formatUSDollars } from '@/utils/currency';
import { percentFormatify } from '@/utils/numbers';

import { FundNameCellContent } from './FundNameCellContent';
import styles from './FundsTable.module.css';
import { LoadingRow } from './LoadingRow';
import { allocationAccountInfo } from './utils';
import { LabelPopover } from '../label-popover/LabelPopover';
import { NoDataAvailable } from '../no-data-available/NoDataAvailable';

export const NonHoldingFunds = ({
  funds,
  isLoading,
  numberOfLoadingRows = 3,
  lineOfBusiness,
}: {
  funds?: Fund[];
  isLoading?: boolean;
  numberOfLoadingRows?: number;
  lineOfBusiness?: LineOfBusiness;
}) => {
  const { width } = useWindowSize();

  const headerVals = useMemo(() => {
    // Because Next renders on the server first, we were getting hydration error from this switch because the react-use
    // library sets width and height to Infinity by default and if window is undefined (which it is on the server) the width
    // and height never get updated to actual browser window size. Fun!!
    if (width !== Infinity && width > 500) {
      return {
        fundName: 'Name',
        fundValue: 'Value',
        allocation: 'Allocation',
      };
    }

    return {
      fundName: 'Name',
      fundValue: 'Value',
      allocation: 'Alloc.',
    };
  }, [width]);

  if ((!funds || funds.length === 0) && !isLoading) {
    return <NoDataAvailable correlationId={undefined} />;
  }

  const dataValueStyles = (val?: number | null) => {
    return clsx({
      'typography-content-body-sm-bold': !!val,
      [styles.activeFund as string]: !val,
    });
  };

  return (
    <Table preventBackgroundHoverInteraction>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>
            <Label>{toSentenceCase(headerVals.fundName)}</Label>
          </TableHeaderCell>
          <TableHeaderCell>
            <Label
              interactiveElements={[
                <LabelPopover key="Account Value" title="Account Value">
                  {allocationAccountInfo(lineOfBusiness)}
                </LabelPopover>,
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
      {isLoading && (
        <TableBody>
          {Array.from({ length: numberOfLoadingRows }).map((_, index) => (
            <LoadingRow key={index} cellCount={3} />
          ))}
        </TableBody>
      )}
      {!isLoading && (
        <TableBody>
          {funds?.map((fund, i) => {
            return (
              <TableRow
                key={fund.fundId || `${fund}-${i}`}
                className={`typography-content-body-sm ${styles.tableRow}`}
              >
                <TableCell>
                  <FundNameCellContent
                    fundDetails={fund}
                    isElected={fund.isElected}
                    lineOfBusiness={lineOfBusiness}
                  />
                </TableCell>
                <TableCell className={dataValueStyles(fund.totalFundValue)}>
                  {formatUSDollars(fund.totalFundValue, true, true)}
                </TableCell>
                <TableCell
                  className={dataValueStyles(fund.allocationPercentage)}
                >
                  {percentFormatify(fund.allocationPercentage, {
                    isInteger: true,
                    displayNullAsZero: true,
                  })}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      )}
    </Table>
  );
};
