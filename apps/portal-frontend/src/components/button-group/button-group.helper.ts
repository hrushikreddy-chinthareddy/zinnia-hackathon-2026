import { mergeClasses } from '@deps/helpers/props.helper';
import { Variant } from '@deps/types/components';

import { ButtonGroupSize } from './button-group';

export const getSizeClasses = (size: ButtonGroupSize = 'md', classNames: string) => {
    if (size == 'xs') {
        classNames = mergeClasses(classNames, 'text-md');
    } else if (size == 'sm') {
        classNames = mergeClasses(classNames, 'text-[18px]');
    } else if (size === 'xxs') {
        classNames = mergeClasses(classNames, 'text-body-sm');
    }

    return classNames;
};

export const getVariantClasses = (variant: Variant = 'primary', classNames: string, disabled = false) => {
    if (variant === 'primary') {
        const defaultClasses = 'bg-white font-secondary text-gray-900 whitespace-nowrap';
        const selectedClasses = 'rounded-md'; // Use focus-visible instead of focus-within
        const focusBorderClasses =
            'relative focus-visible:before:border-2 focus-visible:before:border-semantic-focus focus-visible:before:z-20 focus-visible:before:rounded'; // Use focus-visible instead of focus-within
        const focusSpacingClasses = 'focus-visible:before:absolute focus-visible:before:inset-[-3px] focus-visible:before:-m-2'; // Use focus-visible instead of focus-within
        const inactiveClasses = 'bg-gray-100 text-gray-900 ring-gray-300';

        const uncheckedClasses = 'hover:bg-primary-lightest hover:border-primary hover:z-10 relative border-2 border-gray-300'; // Added hover styles and border color for unchecked state

        classNames = mergeClasses(
            classNames,
            disabled
                ? inactiveClasses
                : `${defaultClasses} ${selectedClasses} ${uncheckedClasses} ${focusBorderClasses} ${focusSpacingClasses}`
        );
    } else if (variant === 'contrast') {
        const defaultClasses = 'bg-transparent border-white text-white shadow-sm border';
        const hoverClasses = 'hover:bg-gray-600 hover:text-white hover:border-white hover:border-1';
        const pressedClasses = 'focus:bg-gray-800 focus:text-white focus:border-white';
        const selectedClasses = 'active:bg-gray-700 active:text-white active:border-white active:border-4';
        const inactiveClasses = 'bg-gray-800 text-gray-600 border-gray-600 border';

        const focusBorderClasses =
            'relative focus-within:before:border-2 focus-within:before:border-white focus-within:before:z-20 focus-within:before:rounded'; // Added z-index to keep outermost border on top
        const focusSpacingClasses = 'focus-within:before:absolute focus-within:before:inset-0 focus-within:before:-m-2'; // Adjusted spacing for focus border

        classNames = mergeClasses(
            classNames,
            disabled
                ? inactiveClasses
                : `${defaultClasses} ${hoverClasses} ${pressedClasses} ${selectedClasses} ${focusBorderClasses} ${focusSpacingClasses}`
        );
    }

    return classNames;
};

export const getClasses = (
    size: ButtonGroupSize = 'sm',
    variant: Variant = 'primary',
    // display: Display = 'block',
    classNames: string,
    disabled = false
) => {
    const sizeClasses = getSizeClasses(size, classNames);
    const variantClasses = getVariantClasses(variant, sizeClasses, disabled);
    // const displayClasses = getDisplayClasses(display, variantClasses);

    return variantClasses;
};
