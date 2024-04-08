import { isNullEmptyOrUndefined } from './data';
import { DEFAULT_ERROR_STRING } from './strings';

const defaultOptions: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

export const numberFormatify = (
  value?: number | string | null,
  options = defaultOptions,
  roundToMillion = false
): string => {
  if (isNullEmptyOrUndefined(value)) {
    return DEFAULT_ERROR_STRING;
  }

  if (typeof value === 'string') {
    value = parseFloat(value);
  }

  let numberValue = value as number;

  if (isNaN(numberValue)) {
    return DEFAULT_ERROR_STRING;
  }

  if (roundToMillion && numberValue >= 1000000) {
    numberValue = Math.round(numberValue / 100000) / 10;
    return (
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(numberValue) + 'M'
    );
  }

  return new Intl.NumberFormat('en-US', options).format(numberValue);
};

export const formatPaymentAmount = (amount: number | undefined) => {
  return numberFormatify(amount, undefined, true);
};

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
