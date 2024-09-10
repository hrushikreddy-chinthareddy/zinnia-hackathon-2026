import clsx from 'clsx';

import { NestedNavDrawerTest } from '@deps/jest/constants/test-id-constants';
import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';

export interface EndIconProps {
    isExpanded?: boolean;
    classNames?: string;
}

export const EndIcon = ({ isExpanded, classNames }: EndIconProps) => (
    <span className="ml-auto text-white" data-testid={NestedNavDrawerTest.END_ICON}>
        <ChevronDown width={12} height={12} className={clsx({ flip180: isExpanded }, classNames)} />
    </span>
);
