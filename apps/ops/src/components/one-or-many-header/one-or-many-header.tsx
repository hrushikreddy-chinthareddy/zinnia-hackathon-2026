import clsx from 'clsx';
import React from 'react';

import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import PlusOthers from '../plus-others/plus-others';

export interface OneOrManyHeaderProps {
    className?: string;
    entities: { name: string; ssn: string }[];
}

const OneOrManyHeader = ({ entities, className }: OneOrManyHeaderProps) => {
    const defaultClassName = 'text-gray-900 headline-1-d';
    const ownerNameClassName = clsx(className, defaultClassName);

    if (entities.length === 0) {
        return (
            <div data-testid="one-or-many-container" className={defaultClassName}>
                {DEFAULT_ERROR_STRING}
            </div>
        );
    }

    if (entities.length === 1) {
        return (
            <div data-testid="one-or-many-container" className={ownerNameClassName}>
                <PiiWrapper>{entities[0].name}</PiiWrapper>
            </div>
        );
    }

    return (
        <div className="flex items-center" data-testid="one-or-many-container">
            <div className={defaultClassName}>{entities[0].name}</div>
            <PlusOthers entities={entities.slice(1)} />
        </div>
    );
};

export default OneOrManyHeader;
