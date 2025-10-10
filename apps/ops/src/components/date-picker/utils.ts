export const createClickHandler =
    (handler: () => void) => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handler();
    };

export const createKeyDownHandler =
    (handler: () => void) => (e: React.KeyboardEvent) => {
        if (e.key === 'Tab') {
            return;
        }
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            handler();
        }
    };

export const getTabIndex = (isDisabled: boolean, isFocused: boolean) =>
    isDisabled ? -1 : isFocused ? 0 : -1;

export const primaryTextClasses =
    'font-primary font-semibold text-md leading-[21px] text-gray-900 whitespace-nowrap';
export const secondaryTextClasses =
    'font-secondary font-normal text-sm leading-4.5 text-gray-300 whitespace-nowrap';
export const hoverClasses = 'hover:border-accent1 hover:border-2';
export const activeClasses =
    'active:border-primary active:border-2 active:bg-primary-lightest';
export const containerClasses = `${hoverClasses} ${activeClasses} cursor-pointer border-2 border-transparent rounded-lg p-2`;
