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
        <button
          className={clsx(
            'typography-nav-links-sm-inline',
            styles.fundNameTrigger,
            {
              [styles.elected as string]: isElected,
            }
          )}
        >
          {fundName}
          {isElected && <span className="sr-only">is an elected fund</span>}
        </button>
      }
    >
      Fund Details
    </SideSheet>
  );
};
