import { render, screen } from '@testing-library/react';

import { AllocationColorBarTest } from '@deps/jest/constants/test-id-constants';

import AllocationColorBar, { AllocationColor } from './allocation-color-bar';

describe('AllocationColorBar', () => {
    const colors: AllocationColor[] = [
        {
            className: 'bg-red-500',
            allocationPercentage: '50',
        },
        {
            className: 'bg-green-500',
            allocationPercentage: '30',
        },
        {
            className: 'bg-blue-500',
            allocationPercentage: '20',
        },
    ];

    test('renders correctly with provided colors', () => {
        render(<AllocationColorBar colors={colors} />);
        const allocationColorBar = screen.getByTestId(
            AllocationColorBarTest.AllocationColorBar
        );
        const firstBar = allocationColorBar.firstChild;
        expect(firstBar).toHaveClass('bg-red-500');

        const secondBar = allocationColorBar.childNodes[1];
        expect(secondBar).toHaveClass('bg-green-500');

        const thirdBar = allocationColorBar.childNodes[2];
        expect(thirdBar).toHaveClass('bg-blue-500');
    });
});
