export const chunkArray = (arr: any[], size: number): any[][] | any[] =>
    arr.length > size
        ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
        : [arr];

export const narrowIncludes = <T extends U, U>(
    arr: ReadonlyArray<T>,
    search: U
): search is T => arr.includes(search as T);
