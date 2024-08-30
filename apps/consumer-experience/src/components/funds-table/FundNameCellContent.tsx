'use client';
import { toSentenceCase } from '@zinnia/utils';
import clsx from 'clsx';

import { Fund } from '@/services/funds';

import { FundDescription } from './FundDescription';
import { FundDetailsSidesheetInner } from './FundDetailsSidesheetInner';
import styles from './FundsTable.module.css';
import { ControlledSidesheet } from '../controlled-sidesheet/ControlledSidesheet';

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
        <div className="mb-xl typography-content-body">
          <FundDescription fund={fundDetails} />
        </div>

        <FundDetailsSidesheetInner fundDetails={fundDetails} />
      </div>
    </ControlledSidesheet>
  );
};
