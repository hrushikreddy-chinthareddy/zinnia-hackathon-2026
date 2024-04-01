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
