import { PolicySearchKeys } from './search';

export enum CardInfoVariant {
    WARNING = 'WARNING',
    ERROR = 'ERROR',
    DEFAULT = 'DEFAULT',
    EMPTY = 'EMPTY',
}

export type PolicyKeyPlaceholderValues = {
    [key in PolicySearchKeys]: string;
};

export type Size = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant =
    | 'primary'
    | 'secondary'
    | 'contrast'
    | 'error'
    | 'info'
    | 'success'
    | 'text';

export interface TagKey {
    text?: string;
}
