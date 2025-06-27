import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BadgeVariant } from '@deps/components/badge/badge.helpers';

import BadgeWithTooltip from './badge-with-tooltip';

describe('BadgeWithTooltip Component', () => {
    it('displays the badge with the provided label', () => {
        render(
            <BadgeWithTooltip
                label="Badge Label"
                tooltip="Tooltip Text"
                variant={BadgeVariant.Default}
            />
        );

        expect(screen.getByText('Badge Label')).toBeInTheDocument();
    });

    it('displays the tooltip with the provided text when hovered', async () => {
        const user = userEvent.setup();
        render(
            <BadgeWithTooltip
                label="Badge Label"
                tooltip="Tooltip Text"
                variant={BadgeVariant.Default}
            />
        );

        await user.hover(screen.getByText('Badge Label'));
        await waitFor(() => {
            expect(screen.getByRole('tooltip')).toHaveTextContent(
                'Tooltip Text'
            );
            expect(screen.getByRole('tooltip')).toBeVisible();
        });
    });

    it('does not display the tooltip with the provided text when unhovered', async () => {
        const user = userEvent.setup();
        render(
            <BadgeWithTooltip
                label="Badge Label"
                tooltip="Tooltip Text"
                variant={BadgeVariant.Default}
            />
        );

        await user.hover(screen.getByText('Badge Label'));
        await user.unhover(screen.getByText('Badge Label'));

        await waitFor(() => {
            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
            expect(screen.queryByText('Tooltip Text')).not.toBeInTheDocument();
        });
    });
});
