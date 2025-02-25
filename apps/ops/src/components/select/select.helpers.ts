import clsx from 'clsx';
import { ReactNode } from 'react';

import { FieldProps, FieldSize } from '@deps/components/fields/field';

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

type Option = SimpleOption | MultiselectOption;

export type ValueType = string | { [key: string]: string } | undefined;

export type SimpleSelectProps = {
    onChange: (value: string) => void;
    options: SimpleOption[];
    isMultiselect?: never;
    value?: string;
    onOpenChange?: (isOpen: boolean) => void;
};

export type MultiselectProps = {
    onChange: (value: string, displayText: string, isSelected?: boolean) => void;
    options: MultiselectOption[];
    isMultiselect: true;
    value: { [key: string]: string };
    onOpenChange?: (isOpen: boolean) => void;
};

export type SelectProps = (SimpleSelectProps | MultiselectProps) & { disabled?: boolean; maxContentWidth?: boolean } & Omit<
        FieldProps,
        'onChange' | 'value'
    >;

export const getTriggerClasses = (isOpen: boolean) => {
    const hoverFocusClass = 'default-hover default-focus';
    const activeClass = 'active:border-primary';
    const defaultVariantClasses = 'bg-white border-2 border-gray-200 text-gray-900';
    const triggerClasses = clsx(
        'flex w-full flex-row items-center justify-between rounded-lg disabled:border-gray-300 disabled:bg-gray-100',
        hoverFocusClass,
        activeClass,
        defaultVariantClasses,
        { 'border-primary': isOpen }
    );

    return triggerClasses;
};

export const getSelectedValueClasses = (disabled: boolean, size: FieldSize) =>
    clsx(
        'border-0 bg-transparent p-0 font-secondary text-md font-normal leading-5.5 !outline-none !ring-0',
        'cursor-pointer select-none caret-transparent',
        '!block overflow-hidden text-ellipsis whitespace-nowrap text-left',
        {
            'text-gray-600': disabled,
            'py-1 pl-2 pr-2': size === FieldSize.XS,
            'h-9.5 py-2 pl-4 pr-2': size === FieldSize.Small,
            'h-13 p-4 pr-2': size === FieldSize.Default,
        }
    );

export const getItemClasses = (option: Option, index: number, numOptions: number, selected: boolean) =>
    clsx(
        'default-hover relative flex w-full flex-row items-center justify-start border-1 border-transparent px-4 py-2 font-secondary text-md leading-5.5 outline-none focus-visible:border-accent1',
        {
            'rounded-t-lg': index === 0,
            'rounded-b-lg': index === numOptions - 1,
            'bg-primary-lightest': selected,
            'bg-white': !selected,
            'cursor-not-allowed bg-gray-100 text-gray-300': option.disabled,
            'text-gray-900': !option.disabled,
        }
    );

export const getCheckboxClasses = (isSelected: boolean) =>
    clsx('mr-1 h-6 w-6 shrink-0 rounded border-2 border-gray-200 bg-white text-white', {
        'border-primary': isSelected,
    });

export const getCheckboxFillClasses = (isSelected: boolean) =>
    clsx('m-[3px] h-3.5 w-3.5 rounded-sm', {
        'bg-primary': isSelected,
        block: isSelected,
        hidden: !isSelected,
    });
