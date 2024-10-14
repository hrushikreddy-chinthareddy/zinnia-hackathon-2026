import { composeStories } from '@storybook/react';
import { fireEvent, render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

import ClickWrapper from './click-wrapper';
import * as stories from './click-wrapper.stories';

expect.extend(toHaveNoViolations);

// Mock the handleKeyDown function from '@deps/utils/events' to avoid errors in the tests
jest.mock('@deps/utils/events', () => ({
    handleKeyDown: jest.fn(),
}));

describe('ClickWrapper', () => {
    const { ClickWrapperComponent } = composeStories(stories);

    test('should render children', () => {
        const { getByText } = render(
            <ClickWrapper ariaLabel="Click Wrapper">
                <span>Click Me</span>
            </ClickWrapper>
        );
        const clickWrapperElement = getByText('Click Me');
        expect(clickWrapperElement).toBeInTheDocument();
    });

    test('should call onClick when clicked', () => {
        const onClickMock = jest.fn();
        const { getByText } = render(
            <ClickWrapper onClick={onClickMock} ariaLabel="Click Wrapper">
                Click Me
            </ClickWrapper>
        );
        const clickWrapperElement = getByText('Click Me');
        fireEvent.click(clickWrapperElement);
        expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    test('should not call onClick when disabled', () => {
        const onClickMock = jest.fn();
        const { getByText } = render(
            <ClickWrapper isDisabled onClick={onClickMock} ariaLabel="Click Wrapper">
                Click Me
            </ClickWrapper>
        );
        const clickWrapperElement = getByText('Click Me');
        fireEvent.click(clickWrapperElement);
        expect(onClickMock).not.toHaveBeenCalled();
    });

    test('should have correct role and aria-label', () => {
        const ariaLabel = 'Click Wrapper';
        const { getByRole } = render(<ClickWrapper ariaLabel={ariaLabel}>Click Me</ClickWrapper>);
        const clickWrapperElement = getByRole('button');
        expect(clickWrapperElement).toBeInTheDocument();
        expect(clickWrapperElement).toHaveAttribute('aria-label', ariaLabel);
    });

    it('Should have no accessibility violations', async () => {
        const { container } = render(<ClickWrapperComponent />);

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
