import { fireEvent, render, screen } from '@testing-library/react';

import { ProgressBarStepsTest } from '@deps/jest/constants/test-id-constants';
import { DEFAULT_STEP_WIDTH } from '@deps/types/constants';

import ProgressBarStepsItem from './progress-bar-steps-item';

describe('ProgressBarStepsItem', () => {
    const mockProps = {
        onClick: jest.fn(),
        text: 'Step 1',
        index: 0,
        isCompleted: false,
        isDisabled: false,
        href: '',
        clickContainerAriaLabel: 'Step 1',
        screenReaderLabel: '',
        testId: 'test-id',
        stepWidth: DEFAULT_STEP_WIDTH,
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the step icon and text', () => {
        render(<ProgressBarStepsItem {...mockProps} />);
        expect(screen.getByText('1. Step 1')).toBeInTheDocument();
    });

    // TODO AD: update to not skip
    it.skip('calls the onClick function when not disabled and clicked', () => {
        render(<ProgressBarStepsItem {...mockProps} />);
        const clickableItem = screen.getByTestId(ProgressBarStepsTest.ClickWrapper);
        fireEvent.click(clickableItem);
        expect(mockProps.onClick).toHaveBeenCalled();
    });

    // TODO AD: update to not skip
    it.skip('does not call the onClick function when disabled and clicked', () => {
        const disabledProps = { ...mockProps, isDisabled: true };
        render(<ProgressBarStepsItem {...disabledProps} />);
        const clickableItem = screen.getByTestId(ProgressBarStepsTest.ClickWrapper);
        fireEvent.click(clickableItem);
        expect(mockProps.onClick).not.toHaveBeenCalled();
    });
});
