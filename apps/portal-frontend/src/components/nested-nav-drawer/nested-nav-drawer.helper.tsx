import clsx from 'clsx';

export const getNavItemClasses = (isActive: boolean, classes?: string) => {
    const activeClasses = {
        'font-semibold [&>div]:text-gray-900': isActive,
    };
    const focusClasses = 'focus:outline-none focus-visible:outline-semantic-focus focus-visible:outline-2 focus-visible:outline-offset-8';
    const linkClasses = clsx(
        `group flex min-h-[24px] w-full items-center !rounded-lg !pl-0 pr-4 text-content-caption font-light text-white hover:bg-gray-800 active:font-medium`,
        focusClasses
    );

    return clsx(linkClasses, activeClasses, classes);
};
