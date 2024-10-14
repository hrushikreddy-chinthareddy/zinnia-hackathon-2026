import { render } from '@testing-library/react';

import DotContainer from './dot-container';

describe('DotContainer Component', () => {
    const defaultProps = {
        dotLeftSide: <span>Left Side</span>,
        dotRightSide: <span>Right Side</span>,
    };

    it('renders dot container with left and right sides', () => {
        const { getByText, container } = render(<DotContainer {...defaultProps} />);
        const leftSideElement = getByText('Left Side');
        const rightSideElement = getByText('Right Side');
        const dotElement = container.querySelector('hr'); // The dot character, which is the content of the dot element
        expect(leftSideElement).toBeInTheDocument();
        expect(rightSideElement).toBeInTheDocument();
        expect(dotElement).toBeInTheDocument();
    });

    it('applies custom class names to dot container, left side, and right side', () => {
        const customClassNames = {
            dotContainerClassName: 'custom-container',
            dotLeftSideClassName: 'custom-left-side',
            dotRightSideClassName: 'custom-right-side',
        };
        const { container } = render(<DotContainer {...defaultProps} {...customClassNames} />);
        const dotContainerElement = container.querySelector('.dot-container.custom-container');
        const leftSideElement = container.querySelector('.dot-left-side.custom-left-side');
        const rightSideElement = container.querySelector('.dot-right-side.custom-right-side');
        expect(dotContainerElement).toBeInTheDocument();
        expect(leftSideElement).toBeInTheDocument();
        expect(rightSideElement).toBeInTheDocument();
    });

    it('applies custom class name to dot element', () => {
        const customDotClassName = 'custom-dot';
        const { container } = render(<DotContainer {...defaultProps} dotClassName={customDotClassName} />);
        const dotElement = container.querySelector('.dot.custom-dot');
        expect(dotElement).toBeInTheDocument();
    });

    it('applies default class names to dot container, left side, and right side if no custom class name is provided', () => {
        const { container } = render(<DotContainer {...defaultProps} />);
        const dotContainerElement = container.querySelector('.dot-container');
        const leftSideElement = container.querySelector('.dot-left-side');
        const rightSideElement = container.querySelector('.dot-right-side');
        expect(dotContainerElement).toBeInTheDocument();
        expect(leftSideElement).toBeInTheDocument();
        expect(rightSideElement).toBeInTheDocument();
    });

    it('renders any valid ReactNode for the left and right sides', () => {
        const { getByText } = render(<DotContainer dotLeftSide={<div>Left Side Div</div>} dotRightSide={<span>Right Side Span</span>} />);
        const leftSideElement = getByText('Left Side Div');
        const rightSideElement = getByText('Right Side Span');
        expect(leftSideElement).toBeInTheDocument();
        expect(rightSideElement).toBeInTheDocument();
    });
});
