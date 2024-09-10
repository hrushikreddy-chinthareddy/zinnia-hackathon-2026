import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

import Accordion from './accordion';

describe('Accordion', () => {
    it('should render the Accordion component with title', () => {
        const title = 'Accordion Title';
        const children = null;

        const { getByText } = render(
            <Accordion isOpen={true} title={title}>
                {children}
            </Accordion>
        );

        expect(getByText(title)).toBeInTheDocument();
    });

    it('should have default closed state when isOpen prop is not provided', () => {
        const title = 'Accordion Title';
        const children = <div>Accordion Content</div>;

        const { getByText, queryByText } = render(<Accordion title={title}>{children}</Accordion>);

        expect(getByText(title)).toBeInTheDocument();
        expect(queryByText('Accordion Content')).toBeNull();
    });

    it('should have open state when isOpen prop is true', () => {
        const title = 'Accordion Title';
        const children = <div>Accordion Content</div>;

        const { getByText } = render(
            <Accordion title={title} isOpen={true}>
                {children}
            </Accordion>
        );

        expect(getByText(title)).toBeInTheDocument();
        expect(getByText('Accordion Content')).toBeInTheDocument();
    });

    it('should render custom header component if provided', () => {
        const title = 'Accordion Title';
        const children = <div>Accordion Content</div>;
        const customHeader = <div>Custom Header</div>;

        const { getByText } = render(
            <Accordion title={title} renderHeaderComponent={customHeader}>
                {children}
            </Accordion>
        );

        expect(getByText('Custom Header')).toBeInTheDocument();
    });
});
