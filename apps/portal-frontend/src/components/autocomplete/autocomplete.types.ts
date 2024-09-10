import { ReactNode } from 'react';

import { FieldProps } from '@deps/components/fields/field';

export interface AutocompleteOptionsProps {
    options: SimpleOption[];
    value: string;
    contentClasses: string;
    matches: SimpleOption[];
}

export type SimpleOption = {
    value: string;
    label: string;
    disabled?: boolean;
};

export type MultiselectOption = {
    value: string;
    label: ReactNode;
    displayText: string;
    disabled?: boolean;
};

export type Option = SimpleOption | MultiselectOption;

export type SimpleSelectProps = {
    onChange: (value: string) => void;
    options: SimpleOption[];
    isMultiselect?: never;
    value?: string;
};

export type SelectProps = SimpleSelectProps & { disabled?: boolean } & Omit<FieldProps, 'onChange' | 'value'>;