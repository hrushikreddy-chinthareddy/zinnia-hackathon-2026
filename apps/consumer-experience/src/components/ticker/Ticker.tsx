import clsx from 'clsx';

import { formatUSDollars } from '@/utils/currency';
import './ticker.css';

import Triangle from './triangle-solid.svg';

export interface Props {
  value?: number;
  subtext?: string;
}
export const Ticker = ({ value, subtext }: Props) => {
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
          'ticker__container--negative': isNegative,
          'ticker__container--positive': isPositive,
          'ticker__container--no-change': value === 0,
        },
        'ticker__container'
      )}
    >
      {(isNegative || isPositive) && (
        <Triangle
          aria-hidden
          className={clsx(
            { 'ticker__arrow--negative': isNegative },
            'ticker__arrow'
          )}
        />
      )}
      <p className="typographyLabelsLabelMd">
        {isPositive && <span>+</span>}
        {formattedVal()}
      </p>
      {subtext && (
        <p
          className={clsx('typography-labels-label-sd-alt', 'ticker__subtext', {
            'ticker__subtext--no-change': value === 0,
          })}
        >
          {subtext}
        </p>
      )}
    </div>
  );
};
