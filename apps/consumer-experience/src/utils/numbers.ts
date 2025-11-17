import { isNullEmptyOrUndefined } from './data';
import { DEFAULT_ERROR_STRING } from './strings';

export const numberWithOrdinal = (value?: number) => {
  if (!value || isNaN(value)) {
    return DEFAULT_ERROR_STRING;
  }

  if (value > 3 && value < 21) return `${value}th`;
  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
};

export const percentFormatify = (
  value?: number | string | null,
  options?: { isInteger?: boolean; displayNullAsZero?: boolean }
): string => {
  const nullAsZeroDisplay = '0%';
  if (isNullEmptyOrUndefined(value)) {
    if (options?.displayNullAsZero) {
      return nullAsZeroDisplay;
    }

    return DEFAULT_ERROR_STRING;
  }

  if (typeof value === 'string') {
    value = parseFloat(value);
  }

  let numberValue = value as number;

  if (isNaN(numberValue)) {
    if (options?.displayNullAsZero) {
      return nullAsZeroDisplay;
    }

    return DEFAULT_ERROR_STRING;
  }

  if (options?.isInteger) {
    numberValue = numberValue / 100;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 2,
  }).format(numberValue);
};

export const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;
export const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

export const MintesToMS = (minutes: number) => minutes * 60 * 1000;
