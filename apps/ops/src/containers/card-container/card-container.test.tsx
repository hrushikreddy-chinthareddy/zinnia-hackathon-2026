import { render, screen } from '@testing-library/react';
import { createRef } from 'react';

import CardContainer from './card-container';

describe('CardContainer', () => {
    describe('render tests', () => {
        it('renders children correctly', () => {
            render(
                <CardContainer>
                    <span data-testid="child-content">Test Content</span>
                </CardContainer>
            );

            expect(screen.getByTestId('card-container')).toBeVisible();
            expect(screen.getByTestId('child-content')).toBeVisible();
            expect(screen.getByText('Test Content')).toBeVisible();
        });

        it('applies primary variant class by default', () => {
            render(
                <CardContainer>
                    <span>Content</span>
                </CardContainer>
            );

            const container = screen.getByTestId('card-container');
            expect(container).toHaveClass('primary');
        });

        it('applies secondary variant class when variant is secondary', () => {
            render(
                <CardContainer variant="secondary">
                    <span>Content</span>
                </CardContainer>
            );

            const container = screen.getByTestId('card-container');
            expect(container).toHaveClass('secondary');
        });

        it('applies full width class by default', () => {
            render(
                <CardContainer>
                    <span>Content</span>
                </CardContainer>
            );

            const container = screen.getByTestId('card-container');
            const contentDiv = container.firstChild;
            expect(contentDiv).toHaveClass('w-full');
        });

        it('does not apply full width class when fullWidth is false', () => {
            render(
                <CardContainer fullWidth={false}>
                    <span>Content</span>
                </CardContainer>
            );

            const container = screen.getByTestId('card-container');
            const contentDiv = container.firstChild;
            expect(contentDiv).not.toHaveClass('w-full');
        });

        it('applies custom classNames to content div', () => {
            render(
                <CardContainer classNames="custom-class another-class">
                    <span>Content</span>
                </CardContainer>
            );

            const container = screen.getByTestId('card-container');
            const contentDiv = container.firstChild;
            expect(contentDiv).toHaveClass('custom-class');
            expect(contentDiv).toHaveClass('another-class');
        });

        it('applies custom containerClassNames to outer container', () => {
            render(
                <CardContainer containerClassNames="container-custom-class">
                    <span>Content</span>
                </CardContainer>
            );

            const container = screen.getByTestId('card-container');
            expect(container).toHaveClass('container-custom-class');
        });

        it('combines all className props correctly', () => {
            render(
                <CardContainer
                    classNames="content-class"
                    containerClassNames="outer-class"
                    variant="secondary"
                    fullWidth={true}
                >
                    <span>Content</span>
                </CardContainer>
            );

            const container = screen.getByTestId('card-container');
            const contentDiv = container.firstChild;

            expect(container).toHaveClass('outer-class');
            expect(container).toHaveClass('secondary');
            expect(contentDiv).toHaveClass('content-class');
            expect(contentDiv).toHaveClass('w-full');
        });
    });

    describe('ref forwarding', () => {
        it('forwards ref to the outer container div', () => {
            const ref = createRef<HTMLDivElement>();

            render(
                <CardContainer ref={ref}>
                    <span>Content</span>
                </CardContainer>
            );

            expect(ref.current).not.toBeNull();
            expect(ref.current).toBe(screen.getByTestId('card-container'));
        });
    });
});
