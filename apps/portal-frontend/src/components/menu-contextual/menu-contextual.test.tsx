import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import MenuContextual, { MenuContextualProps } from '@deps/components/menu-contextual/menu-contextual';
import MenuContextualItem from '@deps/components/menu-contextual/menu-contextual-item/menu-contextual-item';
import MenuContextualLabel from '@deps/components/menu-contextual/menu-contextual-label/menu-contextual-label';
import { NOOP } from '@deps/types/constants';

jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        push: NOOP,
    })),
}));

describe('MenuContextual', () => {
    // Helper function to render the component with props
    const renderMenuContextual = (props?: Partial<MenuContextualProps>) => {
        const defaultProps: MenuContextualProps = {
            trigger: 'Open Menu',
            children: (
                <MenuContextualLabel label="Section">
                    <MenuContextualItem content="Input selection" href="/" />
                </MenuContextualLabel>
            ),
        };

        const mergedProps = { ...defaultProps, ...props };

        return render(<MenuContextual {...mergedProps}>{mergedProps.children}</MenuContextual>);
    };

    it('renders the trigger content', () => {
        renderMenuContextual();

        const trigger = screen.getByText('Open Menu');
        expect(trigger).toBeInTheDocument();
    });

    it('opens the menu and renders the children when the trigger is clicked', async () => {
        const user = userEvent.setup();
        renderMenuContextual();

        user.click(screen.getByText('Open Menu'));

        expect(await screen.findByText('Section')).toBeInTheDocument();
        expect(await screen.findByText('Input selection')).toBeInTheDocument();
    });

    it('does not render the children when the menu is closed', () => {
        renderMenuContextual();

        expect(screen.queryByText('Section')).toBeNull();
        expect(screen.queryByText('Input selection')).toBeNull();
    });

    it('closes the menu when the Escape key is pressed', async () => {
        renderMenuContextual();

        fireEvent.click(screen.getByText('Open Menu'));
        fireEvent.keyDown(screen.getByText('Open Menu'), { key: 'Escape' });

        expect(screen.queryByText('Section')).toBeNull();
        expect(screen.queryByText('Input selection')).toBeNull();
    });
});
