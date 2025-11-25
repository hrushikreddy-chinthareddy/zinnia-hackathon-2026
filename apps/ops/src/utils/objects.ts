export const areObjectsEqual = <t1, t2>(obj1: t1, obj2: t2) => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
};

type Entries<T> = {
    [K in keyof T]: [K, T[K]];
}[keyof T][];

export const typedEntries = <T extends object>(object: T): Entries<T> =>
    Object.entries(object) as Entries<T>;
