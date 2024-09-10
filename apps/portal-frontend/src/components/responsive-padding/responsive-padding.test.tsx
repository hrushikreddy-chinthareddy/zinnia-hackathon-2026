import { render } from '@testing-library/react';
import React from 'react';

import ResponsivePadding from './responsive-padding';

describe('ResponsivePadding', () => {
    // Renders a <section> element with default padding of 16px on all sides.
    it('should render a section element with default padding', () => {
        const { getByText } = render(<ResponsivePadding>Hello world</ResponsivePadding>);
        const renderedText = getByText('Hello world');
        expect(renderedText).toBeInTheDocument();
        expect(renderedText).toHaveClass('p-4 md:p-6 lg:p-8');
        expect(renderedText.tagName).toBe('SECTION');
    });

    // Accepts a 'className' prop to add additional classes to the <section> element.
    it('should add additional classes when className prop is provided', () => {
        const { getByText } = render(<ResponsivePadding className="custom-class">Hello world</ResponsivePadding>);
        const renderedText = getByText('Hello world');
        expect(renderedText).toHaveClass('custom-class');
    });

    // Accepts a 'Tag' prop to specify a different HTML tag for the container element.
    it('should render a different HTML tag when Tag prop is provided', () => {
        const { getByText } = render(<ResponsivePadding Tag={'div'}>Hello world</ResponsivePadding>);
        const renderedText = getByText('Hello world');
        expect(renderedText.tagName).toBe('DIV');
    });
});
