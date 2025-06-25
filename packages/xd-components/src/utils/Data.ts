export const isNullEmptyOrUndefined = <T>(value: T): boolean =>
  value === null || value === undefined || value === '';
