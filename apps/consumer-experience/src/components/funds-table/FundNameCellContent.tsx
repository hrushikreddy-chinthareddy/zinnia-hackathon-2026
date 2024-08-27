'use client';
import { FundAccountTypeEnum } from '@zinnia/api-types/types/funds';
import { toSentenceCase } from '@zinnia/utils';
import clsx from 'clsx';

import { Fund } from '@/services/funds';

import { FundDetailsSidesheet } from './FundDetailsSidesheet';
import styles from './FundsTable.module.css';
import { ControlledSidesheet } from '../controlled-sidesheet/ControlledSidesheet';

const descriptionText = (fundType?: FundAccountTypeEnum) => {
  switch (fundType) {
    case FundAccountTypeEnum.HOLDING:
      return (
        <p>
          The money that will eventually be deposited into your elected funds
          first stops here. Your holding fund value is still earning an interest
          rate during the time it waits for the next sweep date.
        </p>
      );
    case FundAccountTypeEnum.INDEXED:
      return (
        <div>
          <p className="mb-lg">
            This is an indexed account with a segment cap. Your account is
            credited with interest earnings based on how the tracked index (in
            this case, the S&P 500®) increases between certain points of time
            (called segments). The segment cap is a ceiling on what your account
            can earn . For example, if the index increases 10% between the start
            and end of a segment, and your segment cap is 5%, the account will
            be credited with 5% interest.
          </p>
          <p>
            Segment performance details are available in your account
            statements.
          </p>
        </div>
      );
    case FundAccountTypeEnum.FIXED:
      return (
        <p>
          This fund earns a guaranteed interest rate for your contributions.{' '}
        </p>
      );
    default:
      return '';
  }
};

export const FundNameCellContent = ({
  isElected,
  fundDetails,
}: {
  isElected?: boolean;
  fundDetails: Fund;
}) => {
  // TODO: what is the null handling here?
  if (!fundDetails) {
    return null;
  }

  return (
    <ControlledSidesheet
      header={toSentenceCase('fund details')}
      trigger={
        <span>
          <span
            className={clsx(
              styles.fundNameTrigger,
              'typography-nav-links-sm-inline'
            )}
          >
            {isElected && <span className={styles.isElected}>&#x2022;</span>}
            {fundDetails.fundName}
          </span>
          {isElected && <span className="sr-only">is an elected fund</span>}
        </span>
      }
    >
      <div className="typography-content-body-sm">
        <p className="typography-desktop-headline-3-d mb-xl">
          {fundDetails.fundName}
        </p>
        <div className="mb-xl">
          {descriptionText(fundDetails.fundAccountType)}
        </div>

        <FundDetailsSidesheet fundDetails={fundDetails} />
      </div>
    </ControlledSidesheet>
  );
};
