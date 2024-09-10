import clsx from 'clsx';

import { NestedNavDrawerTest } from '@deps/jest/constants/test-id-constants';

export interface StartIconProps {
    isActive?: boolean;
    icon?: JSX.Element;
    isParent?: boolean;
}

export const StartIcon = ({ isActive, isParent = false, icon }: StartIconProps) => {
    if (isParent || icon) {
        const startIconClasses = clsx('rounded-r py-[1.5px] pl-4 pr-1 [&>svg]:h-[20px] [&>svg]:w-[20px]', { 'bg-white': isActive });

        return (
            <div className={startIconClasses} data-testid={NestedNavDrawerTest.START_ICON}>
                {icon}
            </div>
        );
    }

    const frontIconCircleClasses = clsx(
        `ml-[22px] mr-[18px] block h-[8px] w-[8px] rounded-full`,
        isActive && 'bg-white',
        isActive || 'group-focus:bg-white group-active:bg-white'
    );

    return <span className={frontIconCircleClasses} data-testid={NestedNavDrawerTest.START_ICON}></span>;
};
