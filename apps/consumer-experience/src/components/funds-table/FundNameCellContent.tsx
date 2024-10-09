'use client';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';
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
  lineOfBusiness,
}: {
  isElected?: boolean;
  fundDetails: Fund;
  lineOfBusiness?: LineOfBusiness;
}) => {
  // TODO: what is the null handling here?
  if (!fundDetails) {
    return null;
  }

  return (
    <ControlledSidesheet
      header={toSentenceCase('details')}
      trigger={
        <span>
          <span
            className={clsx(
              styles.fundNameTrigger,
              'typography-nav-links-sm-inline'
            )}
          >
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

        <FundDetailsSidesheetInner
          fundDetails={fundDetails}
          lineOfBusiness={lineOfBusiness}
        />
      </div>
    </ControlledSidesheet>
  );
};
