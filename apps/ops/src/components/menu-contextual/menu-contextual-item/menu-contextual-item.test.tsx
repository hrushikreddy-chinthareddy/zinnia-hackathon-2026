import { Content, Root } from '@radix-ui/react-dropdown-menu';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Icon, IconType } from '@zinnia/bloom/components';
import { ReactNode } from 'react';

import MenuContextualItem from '@deps/components/menu-contextual/menu-contextual-item/menu-contextual-item';

const customRender = (children: ReactNode) => {
    return render(
        <Root open>
            <Content>{children}</Content>
        </Root>
    );
};

describe('MenuContextualItem', () => {
    describe('Rendering', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.spyOn(console, 'warn').mockImplementation();
        });

        it('should render a contextual item with content and icon', async () => {
            customRender(
                <MenuContextualItem
                    content="Test Content"
                    href="https://example.com"
                    icon={<Icon type={IconType.EXTERNAL_LINK} />}
                />
            );

            await waitFor(() => {
                // Verify content is rendered
                const linkElement = screen.getByText('Test Content');
                expect(linkElement).toBeInTheDocument();

                // Verify icon is rendered
                const anchorElement = linkElement.closest('a');
                const svgElement = anchorElement?.querySelector('svg');
                expect(svgElement).toBeInTheDocument();

                // Verify link attributes
                expect(anchorElement).toHaveAttribute(
                    'href',
                    'https://example.com'
                );
            });
        });

        it('should render a contextual item with content', async () => {
            customRender(
                <MenuContextualItem
                    content="Test Content"
                    href="https://example.com"
                />
            );

            await waitFor(() => {
                const linkElement = screen.getByText('Test Content');
                expect(linkElement).toBeInTheDocument();
            });
        });

        it('should render with an icon when provided', async () => {
            customRender(
                <MenuContextualItem
                    content="Test Content"
                    href="https://example.com"
                    icon={<Icon type={IconType.EXTERNAL_LINK} />}
                />
            );

            await waitFor(() => {
                const linkElement = screen.getByText('Test Content');
                expect(linkElement).toBeInTheDocument();

                // Check that an SVG icon is rendered (Bloom Icon renders as SVG)
                const svgElement = linkElement
                    .closest('a')
                    ?.querySelector('svg');
                expect(svgElement).toBeInTheDocument();
            });
        });

        it('should render without an icon when not provided', async () => {
            customRender(
                <MenuContextualItem
                    content="Test Content"
                    href="https://example.com"
                />
            );

            await waitFor(() => {
                const linkElement = screen.getByText('Test Content');
                expect(linkElement).toBeInTheDocument();

                // Check that no SVG icon is rendered when icon prop is not provided
                const svgElement = linkElement
                    .closest('a')
                    ?.querySelector('svg');
                expect(svgElement).not.toBeInTheDocument();
            });
        });
    });

    describe('Link Behavior', () => {
        it('should render as a link with correct href', async () => {
            customRender(
                <MenuContextualItem
                    content="Test Content"
                    href="https://example.com"
                />
            );

            await waitFor(() => {
                const linkElement = screen.getByText('Test Content');
                const anchorElement = linkElement.closest('a');
                expect(anchorElement).toBeInTheDocument();
                expect(anchorElement).toHaveAttribute(
                    'href',
                    'https://example.com'
                );
            });
        });

        it('should open in new tab when openInNewTab is true', async () => {
            customRender(
                <MenuContextualItem
                    content="Test Content"
                    href="https://example.com"
                    openInNewTab={true}
                />
            );

            await waitFor(() => {
                const linkElement = screen.getByText('Test Content');
                const anchorElement = linkElement.closest('a');
                expect(anchorElement).toHaveAttribute('target', '_blank');
                expect(anchorElement).toHaveAttribute(
                    'rel',
                    'noopener noreferrer'
                );
            });
        });

        it('should not have target or rel attributes when openInNewTab is false', async () => {
            customRender(
                <MenuContextualItem
                    content="Test Content"
                    href="https://example.com"
                    openInNewTab={false}
                />
            );

            await waitFor(() => {
                const linkElement = screen.getByText('Test Content');
                const anchorElement = linkElement.closest('a');
                expect(anchorElement).not.toHaveAttribute('target');
                expect(anchorElement).not.toHaveAttribute('rel');
            });
        });
    });

    describe('onClick Handler', () => {
        it('should call onClick handler when item is clicked', async () => {
            const mockOnClick = jest.fn();
            customRender(
                <MenuContextualItem
                    content="Test Content"
                    href="https://example.com"
                    onClick={mockOnClick}
                    openInNewTab={true}
                />
            );

            await waitFor(() => {
                const linkElement = screen.getByText('Test Content');
                expect(linkElement).toBeInTheDocument();
            });

            const linkElement = screen.getByText('Test Content');
            await userEvent.click(linkElement);

            await waitFor(() => {
                expect(mockOnClick).toHaveBeenCalled();
            });
        });

        it('should work without onClick handler', async () => {
            // Test that component renders and works without onClick prop
            customRender(
                <MenuContextualItem
                    content="Test Content"
                    href="https://example.com"
                />
            );

            await waitFor(() => {
                const linkElement = screen.getByText('Test Content');
                expect(linkElement).toBeInTheDocument();

                // Verify the link is properly configured
                const anchorElement = linkElement.closest('a');
                expect(anchorElement).toHaveAttribute(
                    'href',
                    'https://example.com'
                );
            });
        });
    });
});
