export const isNumber = (value: string) => {
  return /^\d+$/.test(value);
};

export const isNumberOrHyphen = (value: string) => {
  return /^[0-9-]+$/.test(value);
};
