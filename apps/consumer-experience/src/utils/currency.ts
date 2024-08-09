import { isNullEmptyOrUndefined } from './data';
import { DEFAULT_ERROR_STRING } from './strings';

const defaultOptions: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

export const parseNumber = (
  val?: number | null | string,
  displayNullAsZero?: boolean
) => {
  const zeroDisplay = '$0';

  if (isNullEmptyOrUndefined(val)) {
    if (displayNullAsZero) {
      return zeroDisplay;
    }

    return DEFAULT_ERROR_STRING;
  }

  if (val === 0) {
    return zeroDisplay;
  }

  if (typeof val === 'string') {
    val = parseFloat(val);
  }

  const numberValue = val as number;

  if (isNaN(numberValue)) {
    return DEFAULT_ERROR_STRING;
  }

  return numberValue;
};

/**
 * Formats a number or string value into a string representation of a currency value.
 *
 * @param {number | string | null} value - The value to be formatted.
 * @param {Intl.NumberFormatOptions} [options=defaultOptions] - The options to be used for formatting.
 * @param {boolean} [roundToMillion=false] - Whether to round the value to the nearest million.
 * @return {string} The formatted string representation of the value.
 */
export const formatUSDollars = (
  val?: number | null | string,
  displayNullAsZero?: boolean,
  roundToMillion?: boolean
) => {
  let numberValue = parseNumber(val, displayNullAsZero);

  if (typeof numberValue !== 'number') {
    return numberValue;
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

  return new Intl.NumberFormat('en-US', defaultOptions).format(numberValue);
};

export const formatUSDollarsAccounting = (
  val?: number | null | string,
  displayNullAsZero?: boolean,
  roundToMillion?: boolean
) => {
  const numberValue = parseNumber(val, displayNullAsZero);

  if (typeof numberValue !== 'number') {
    return numberValue;
  }

  if (numberValue < 0) {
    const numberValAbsolute = Math.abs(numberValue);
    return `(${formatUSDollars(
      numberValAbsolute,
      displayNullAsZero,
      roundToMillion
    )})`;
  }

  return formatUSDollars(numberValue, displayNullAsZero, roundToMillion);
};
