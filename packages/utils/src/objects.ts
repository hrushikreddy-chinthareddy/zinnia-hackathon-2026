export const areObjectsEqual = <t1, t2>(obj1: t1, obj2: t2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};
