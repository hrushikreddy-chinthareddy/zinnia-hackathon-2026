import clsx from 'clsx';

import { FieldSize } from '@deps/components/fields/field';

import { Option } from './autocomplete.types';

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
