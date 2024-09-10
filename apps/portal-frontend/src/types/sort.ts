export type Order = 'asc' | 'desc';

export type SortObject<Key extends keyof any> = {
    [key in Key]: number | string;
};
