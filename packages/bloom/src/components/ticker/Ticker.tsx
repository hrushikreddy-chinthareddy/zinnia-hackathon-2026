import clsx from 'clsx';

import { formatUSDollars } from '@/utils/currency';

import Triangle from './triangle-solid.svg';
import styles from './ticker.module.css';
import { TickerProps } from './types';

export const Ticker = ({ value, subtext }: TickerProps) => {
  if (value === null || value === undefined) {
    return null;
  }

  const formattedVal = () => {
    if (value === 0) {
      return 'No change';
    }

    return formatUSDollars(value);
  };

  const isNegative = value < 0;
  const isPositive = value > 0;

  return (
    <div
      className={clsx(
        {
          [styles.negative as string]: isNegative,
          [styles.positive as string]: isPositive,
          [styles.noChange as string]: value === 0,
        },
        styles.tickerContainer
      )}
    >
      {(isNegative || isPositive) && (
        <Triangle
          aria-hidden
          className={clsx({
            [styles.tickerArrowNegative as string]: isNegative,
          })}
        />
      )}
      <p className="typography-labels-label-md">
        {isPositive && <span>+</span>}
        {formattedVal()}
      </p>
      {subtext && (
        <p
          className={clsx(
            'typography-labels-label-sm-alt',
            styles.tickerSubtext,
            {
              [styles.tickerSubtextNoChange as string]: value === 0,
            }
          )}
        >
          {subtext}
        </p>
      )}
    </div>
  );
};
