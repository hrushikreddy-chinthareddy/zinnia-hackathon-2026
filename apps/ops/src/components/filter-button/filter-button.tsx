import { ButtonHTMLAttributes } from 'react';

import { FilterButtonTest } from '@deps/jest/constants/test-id-constants';
import { ReactComponent as FilterIcon } from '@deps/styles/elements/icons/icons_outlined/filter.svg';

export type FilterButtonProps = {
    selected?: boolean;
} & ButtonHTMLAttributes<HTMLDivElement>;

export default function FilterButton({ selected, ...rest }: FilterButtonProps) {
    const hoverClass = 'hover:bg-secondary-dark hover:text-white';
    const selectedClass = selected ? 'bg-secondary text-white' : 'bg-white text-gray-900';
    const classes = `flex items-center justify-center w-8 h-8 rounded-full ${selectedClass} ${hoverClass}`;

    return (
        <div data-testid={FilterButtonTest.Container} className={classes} {...rest}>
            <FilterIcon width={13} height={13} />
        </div>
    );
}
