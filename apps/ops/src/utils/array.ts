export const chunkArray = (arr: any[], size: number): any[][] | any[] =>
    arr.length > size
        ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
        : [arr];
