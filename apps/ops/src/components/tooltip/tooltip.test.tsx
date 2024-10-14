import { cleanup, render, screen } from '@testing-library/react';
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
});
