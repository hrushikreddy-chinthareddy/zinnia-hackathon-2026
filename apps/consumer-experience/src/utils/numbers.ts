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
