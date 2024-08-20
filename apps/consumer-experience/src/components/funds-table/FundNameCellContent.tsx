import { SideSheet } from '@zinnia/bloom/components';
import { toTitleCase } from '@zinnia/utils';
import clsx from 'clsx';

import styles from './FundsTable.module.css';

export const FundNameCellContent = ({
  fundName,
  isElected,
}: {
  fundName: string;
  isElected?: boolean;
}) => {
  return (
    <SideSheet
      header={toTitleCase('fund details')}
      trigger={
        <span>
          <span
            className={clsx(
              styles.fundNameTrigger,
              'typography-nav-links-sm-inline'
            )}
          >
            {isElected && <span className={styles.isElected}>&#x2022;</span>}
            {fundName}
          </span>
          {isElected && <span className="sr-only">is an elected fund</span>}
        </span>
      }
    >
      Fund Details
    </SideSheet>
  );
};
