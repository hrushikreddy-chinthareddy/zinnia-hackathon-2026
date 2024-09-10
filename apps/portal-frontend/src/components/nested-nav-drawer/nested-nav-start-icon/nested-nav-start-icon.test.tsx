import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

import { StartIcon, StartIconProps } from './nested-nav-start-icon';

// Helper function to render the StartIcon component with required props
const renderStartIcon = (props: Partial<StartIconProps> = {}) => {
    const defaultProps: StartIconProps = {
        isActive: false,
        isParent: false,
        icon: undefined,
    };
    const mergedProps = { ...defaultProps, ...props };
    return render(<StartIcon {...mergedProps} />);
};

describe('StartIcon', () => {
    it('renders a div with correct classes when isParent is true', () => {
        const { container } = renderStartIcon({ isParent: true });
        const startIconDiv = container.querySelector('div');
        expect(startIconDiv).toBeInTheDocument();
        expect(startIconDiv).toHaveClass('rounded-r py-[1.5px] pl-4 pr-1 [&>svg]:h-[20px] [&>svg]:w-[20px]');
    });

    it('renders a div with additional bg-white class when isActive is true and isParent is true', () => {
        const { container } = renderStartIcon({ isParent: true, isActive: true });
        const startIconDiv = container.querySelector('div');
        expect(startIconDiv).toBeInTheDocument();
        expect(startIconDiv).toHaveClass('bg-white');
    });

    it('renders the icon when passed in as a prop', () => {
        const fakeIcon = <svg data-testid="fake-icon">Fake Icon</svg>;
        const { container, getByTestId } = renderStartIcon({ icon: fakeIcon });
        const startIconDiv = container.querySelector('div');
        const iconElement = getByTestId('fake-icon');
        expect(startIconDiv).toBeInTheDocument();
        expect(iconElement).toBeInTheDocument();
        expect(iconElement).toHaveTextContent('Fake Icon');
    });

    it('renders a span with correct classes when isParent is false and icon is not provided', () => {
        const { container } = renderStartIcon();
        const startIconSpan = container.querySelector('span');
        expect(startIconSpan).toBeInTheDocument();
        expect(startIconSpan).toHaveClass('ml-[22px] mr-[18px] block h-[8px] w-[8px] rounded-full');
    });

    it('renders a span with additional bg-white class when isActive is true and isParent is false', () => {
        const { container } = renderStartIcon({ isActive: true });
        const startIconSpan = container.querySelector('span');
        expect(startIconSpan).toBeInTheDocument();
        expect(startIconSpan).toHaveClass('bg-white');
    });
});
