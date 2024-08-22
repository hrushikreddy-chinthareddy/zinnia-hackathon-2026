import { Button, Icon, IconType } from '@zinnia/bloom/components';
import { toSentenceCase } from '@zinnia/utils';
import clsx from 'clsx';

import styles from './FundsTable.module.css';
import { ControlledSidesheet } from '../controlled-sidesheet/ControlledSidesheet';

export const FundNameCellContent = ({
  fundName,
  isElected,
}: {
  fundName: string;
  isElected?: boolean;
}) => {
  return (
    <ControlledSidesheet
      header={toSentenceCase('fund details')}
      closeBeforeContent={
        <Button size="small" mode="link" className={styles.backButton}>
          <Icon small type={IconType.CHEVRON} className={styles.chevronBack} />
          Back to fund details
        </Button>
      }
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
    </ControlledSidesheet>
  );
};
