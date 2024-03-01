import clsx from 'clsx';

import { RadioVariant } from './radio';

export const radioClasses = (variant: RadioVariant) => {
    const activeClass = 'active:ring-transparent';
    const activeHoverClass =
        'active:hover:border-accent1 active:hover:ring-accent1 active:hover:ring-white active:hover:ring-2 active:hover:bg-white';
    const checkedClass = clsx({
        'checked:border-primary checked:bg-primary checked:ring-2 checked:ring-inset checked:ring-white': variant === RadioVariant.Default,
        'checked:border-primary-lightest checked:bg-lightest checked:text-primary-lightest checked:ring-2 checked:ring-inset checked:ring-white':
            variant === RadioVariant.Inactive,
    });
    const checkedFocusClass = clsx({
        'checked:focus:bg-primary checked:focus:ring-2 checked:focus:ring-inset checked:focus:ring-white checked:focus:ring-offset-0':
            variant === RadioVariant.Default,
        'checked:focus:border-primary-lightest checked:focus:bg-lightest checked:focus:text-primary-lightest checked:focus:ring-2 checked:focus:ring-inset checked:focus:ring-white checked:focus:ring-offset-0':
            variant === RadioVariant.Inactive,
    });
    const focusClass = clsx({
        'default-focus focus:border-2 focus:border-gray-200 focus:bg-white focus:outline-none focus:ring-inset focus:ring-white':
            variant === RadioVariant.Default,
        'default-focus focus:border-2 focus:border-gray-300 focus:bg-gray-100 focus:outline-none': variant === RadioVariant.Inactive,
    });
    const focusHoverClass =
        'focus:hover:ring-accent1 focus:hover:ring-white focus:hover:ring-2 focus:hover:ring-offset-0 focus:hover:bg-white focus:hover:border-accent1';
    const focusHoverCheckedClass = 'focus:hover:checked:bg-accent1';
    const focusVisibleClass =
        'focus:focus-visible:ring-transparent focus:focus-visible:outline focus:focus-visible:outline-2 focus:focus-visible:outline-semantic-focus focus:focus-visible:outline-offset-[6px]';
    const focusVisibileHoverClass =
        'focus:focus-visible:hover:border-accent1 focus:focus-visible:hover:ring-accent1 focus:focus-visible:hover:ring-white focus:focus-visible:hover:ring-2 focus:focus-visible:hover:bg-white';
    const focusVisibleCheckedClass = clsx({
        'focus:focus-visible:checked:bg-primary focus:focus-visible:checked:ring-2 focus:focus-visible:checked:ring-inset focus:focus-visible:checked:ring-white focus:focus-visible:checked:ring-offset-0':
            variant === RadioVariant.Default,
        'focus:focus-visible:checked:bg-lightest focus:focus-visible:checked:ring-2 focus:focus-visible:checked:ring-inset focus:focus-visible:checked:ring-white focus:focus-visible:checked:ring-offset-0':
            variant === RadioVariant.Inactive,
    });
    const focusVisibleCheckedHoverClass = 'focus:focus-visible:hover:checked:bg-accent1';
    const hoverClass =
        'default-hover checked:hover:border-primary checked:hover:bg-primary checked:hover:ring-2 checked:hover:ring-inset checked:hover:ring-white';
    const baseClass = clsx('h-[24px] w-[24px]', {
        'border-2 border-gray-200': variant === RadioVariant.Default,
        'pointer-events-none border-2 border-gray-300 bg-gray-100 text-gray-100': variant === RadioVariant.Inactive,
    });

    return `
        ${activeClass}
        ${activeHoverClass}
        ${checkedClass}
        ${checkedFocusClass}
        ${focusClass}
        ${focusHoverClass}
        ${focusHoverCheckedClass}
        ${focusVisibleClass}
        ${focusVisibileHoverClass}
        ${focusVisibleCheckedClass}
        ${focusVisibleCheckedHoverClass}
        ${hoverClass}
        ${baseClass}`;
};
