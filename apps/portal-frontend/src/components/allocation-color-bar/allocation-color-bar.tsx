import React from 'react';

import { AllocationColorBarTest } from '@deps/jest/constants/test-id-constants';

export interface AllocationColor {
    className: string;
    allocationPercentage: string;
}

interface AllocationColorBarProps {
    colors: AllocationColor[];
}

const getColorWidth = (percentage: string) => ({ width: percentage + '%' });

const AllocationColorBar: React.FC<AllocationColorBarProps> = ({ colors }) => {
    const colorLength = colors.length;

    return (
        <div className="flex h-2 w-full rounded-md" data-testid={AllocationColorBarTest.AllocationColorBar}>
            {colors.map((color, index) => {
                const firstElementClasses = index === 0 ? 'rounded-l-lg' : '';
                const lastElementClasses = index === colors.length - 1 ? 'rounded-r-lg' : '';
                const elementsBeforeLastClasses = index < colorLength - 1 ? 'mr-0.5' : '';

                return (
                    <div
                        key={index}
                        className={`${color.className} ${firstElementClasses} ${lastElementClasses} ${elementsBeforeLastClasses}`}
                        style={getColorWidth(color.allocationPercentage)}
                    />
                );
            })}
        </div>
    );
};

export default AllocationColorBar;
