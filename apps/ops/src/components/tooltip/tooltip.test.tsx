import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TooltipTest } from '@deps/jest/constants/test-id-constants';

import Tooltip, { PopoverPlacement } from './tooltip';

const tooltipBody = 'Tooltip body test';
const tooltipChildTestId = 'tooltip-child-test-id';
const tooltipChild = <p data-testid={tooltipChildTestId}>Tooltip Child Test</p>;

afterEach(cleanup);

describe('Tooltip Component', () => {
    it('should correctly display the body', async () => {
        render(
            <Tooltip placement={PopoverPlacement.TopRight} body={tooltipBody}>
                {tooltipChild}
            </Tooltip>
        );

        const notFoundBody = screen.queryByTestId(TooltipTest.Body);
        expect(notFoundBody).toEqual(null);

        await userEvent.hover(screen.getByTestId(TooltipTest.Tooltip));

        const foundBody = await screen.findByTestId(TooltipTest.Body);
        expect(foundBody).toBeInTheDocument();
    });

    it('should correctly render the children', async () => {
        render(
            <Tooltip placement={PopoverPlacement.TopRight} body={tooltipBody}>
                {tooltipChild}
            </Tooltip>
        );

        await userEvent.hover(screen.getByTestId(TooltipTest.Tooltip));

        expect(screen.getByTestId(tooltipChildTestId)).toBeInTheDocument();
    });

    it('should not have role="note" on the trigger', () => {
        render(
            <Tooltip placement={PopoverPlacement.TopRight} body={tooltipBody}>
                {tooltipChild}
            </Tooltip>
        );

        const trigger = screen.getByTestId(TooltipTest.Tooltip);
        expect(trigger).not.toHaveAttribute('role', 'note');
    });

    it('should apply aria-label to the trigger when provided', () => {
        render(
            <Tooltip
                placement={PopoverPlacement.TopRight}
                body={tooltipBody}
                triggerAriaLabel="Active"
            >
                {tooltipChild}
            </Tooltip>
        );

        const trigger = screen.getByTestId(TooltipTest.Tooltip);
        expect(trigger).toHaveAttribute('aria-label', 'Active');
    });

    it('should link trigger to tooltip content via aria-describedby when open', async () => {
        render(
            <Tooltip placement={PopoverPlacement.TopRight} body={tooltipBody}>
                {tooltipChild}
            </Tooltip>
        );

        const trigger = screen.getByTestId(TooltipTest.Tooltip);
        expect(trigger).not.toHaveAttribute('aria-describedby');

        await userEvent.hover(trigger);

        await waitFor(() => {
            const describedBy = trigger.getAttribute('aria-describedby');
            expect(describedBy).toBeTruthy();
            const tooltipContent = document.getElementById(describedBy!);
            expect(tooltipContent).toHaveTextContent(tooltipBody);
        });
    });

    it('should expose tooltip content with role="tooltip" for screen readers', async () => {
        render(
            <Tooltip placement={PopoverPlacement.TopRight} body={tooltipBody}>
                {tooltipChild}
            </Tooltip>
        );

        await userEvent.hover(screen.getByTestId(TooltipTest.Tooltip));

        await waitFor(() => {
            expect(screen.getByRole('tooltip')).toHaveTextContent(tooltipBody);
        });
    });
});
