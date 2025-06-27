/* eslint-disable @typescript-eslint/no-empty-function */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SideSheet from './side-sheet'; // Adjust the import path as needed
import Popover from '../popover/popover';

describe('SideSheet', () => {
    test('should disable scroll when opened and enable when closed', () => {
        const { rerender } = render(
            <SideSheet open={false} handleClose={() => {}} />
        );

        // Scroll should be enabled initially
        expect(document.documentElement.style.overflow).toBe('');

        rerender(<SideSheet open={true} handleClose={() => {}} />);

        // Scroll should be disabled when SideSheet is open
        expect(document.documentElement.style.overflow).toBe('hidden');

        rerender(<SideSheet open={false} handleClose={() => {}} />);

        // Scroll should be enabled when SideSheet is closed
        expect(document.documentElement.style.overflow).toBe('');
    });

    test('popovers should be visible when clicked', async () => {
        render(
            <SideSheet open handleClose={() => {}}>
                Children
                <Popover body="Popover content" title="Popover title">
                    Popover trigger
                </Popover>
            </SideSheet>
        );

        // match z-{number}
        const regex = new RegExp('z-\\d+');

        const children = screen.getByText('Children');
        // if a match exists- returns an array- index 0 is the matched string
        const childrenZIndexValue =
            Number(children.className.match(regex)?.[0].substring(2)) ?? 0;

        userEvent.click(screen.getByText('Popover trigger'));

        const popover = await screen.findByTestId('popover-content-test-id');
        // if a match exists- returns an array- index 0 is the matched string
        const popoverZIndexValue =
            Number(popover.className.match(regex)?.[0].substring(2)) ?? 0;

        expect(popoverZIndexValue).toBeGreaterThanOrEqual(childrenZIndexValue);
    });
});
