export const areAllValuesNull = (obj: object) => {
  return Object.values(obj).every(value => value === null);
};

export const returnNonNullValues = (obj: object) => {
  return Object.values(obj).filter(value => value !== null);
};
