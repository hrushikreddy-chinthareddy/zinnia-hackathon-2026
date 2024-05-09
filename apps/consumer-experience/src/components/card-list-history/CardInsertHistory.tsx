import clsx from 'clsx';
import { ReactNode } from 'react';

import cardStyles from '@/components/clickable-card-container/clickableCardContainer.module.css';
import { formatUSDollars } from '@/utils/currency';
import { standardDateMonthDayYear } from '@/utils/dates';

import styles from './CardInsertHistory.module.css';

interface HistoryItemProps {
  date?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  amount?: number;
  isPending?: boolean;
}

export const CardInsertHistory = ({
  date,
  title,
  subtitle,
  amount,
  isPending,
}: HistoryItemProps) => {
  return (
    <li
      className={clsx(cardStyles.content, styles.container, {
        [styles.pending as string]: isPending,
      })}
    >
      <div className={styles.details}>
        <p
          className={clsx('typography-content-caption', {
            [styles.caption as string]: !isPending,
          })}
        >
          {/* Keeping this hardcoded as scheduled for now, but may need to become a prop at some point */}
          {isPending && <span>Scheduled </span>}
          <span>{standardDateMonthDayYear(date)}</span>
        </p>
        <div className={`typography-labels-label-md-alt ${styles.title}`}>
          {title}
        </div>
        <p className="typography-content-body-sm">{subtitle}</p>
      </div>
      <div className="typography-content-body-bold">
        {formatUSDollars(amount)}
      </div>
    </li>
  );
};
