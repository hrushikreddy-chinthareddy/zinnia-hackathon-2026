import { type IconProps, type LabelProps } from '@zinnia/bloom/components';
import { InputHTMLAttributes } from 'react';

export enum FieldStatus {
    DEFAULT = 'default',
    ERROR = 'error',
    INACTIVE = 'inactive',
    SUCCESS = 'success',
    SELECTED = 'selected',
}

export enum FieldDataActiveTestIds {
    LABEL = 'FieldDataLabelTestId',
    INPUT = 'FieldDataInputTestId',
    ERROR_MESSAGE = 'FieldDataErrorMessageTestId',
    ICON = 'FieldDataIconTestId',
}

export enum FieldValueSize {
    LARGE = 'large',
}

export interface FieldTypes extends InputHTMLAttributes<HTMLInputElement> {
    label?: React.ReactElement<LabelProps>;
    errorMessage?: string;
    fieldStatus?: FieldStatus;
    fieldSize?: FieldValueSize;
    name: string;
}

export interface FieldValueProps extends FieldTypes {
    currencySymbol?: string;
}

export interface FieldDataActiveProps extends FieldTypes {
    icon?: React.ReactElement<IconProps>;
}

export type FieldDateProps = FieldTypes & {
    disableBeforeDate?: Date;
    disableAfterDate?: Date;
    id?: string;
    onDateSelect?: (date: Date | undefined) => void;
    defaultDate?: Date | string;
};

export type DateInterval = {
    before: Date;
    after: Date;
};
