import { Content, Root } from '@radix-ui/react-dropdown-menu';
import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';

import MenuContextualItem from '@deps/components/menu-contextual/menu-contextual-item/menu-contextual-item';
import { NOOP } from '@deps/types/constants';

jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        push: NOOP,
    })),
}));

const customRender = (children: ReactNode) => {
    return render(
        <Root open>
            <Content>{children}</Content>
        </Root>
    );
};

describe('MenuContextualItem', () => {
    it('should render a contextual item with content and icon', () => {
        customRender(
            <MenuContextualItem
                content="Test Content"
                href="https://example.com"
                // eslint-disable-next-line @next/next/no-img-element
                icon={<img height={20} width={20} src="icon.svg" alt="test icon" />}
                disabled={false}
            />
        );

        const linkElement = screen.getByText('Test Content');
        expect(linkElement).toBeInTheDocument();
        const anchorElement = linkElement.closest('a');
        expect(anchorElement).toBeInTheDocument();
        expect(anchorElement).toHaveAttribute('href', 'https://example.com');

        const iconElement = screen.queryByRole('img');
        expect(iconElement).toBeInTheDocument();
    });
});
