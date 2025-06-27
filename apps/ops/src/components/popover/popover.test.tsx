import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PopoverTest } from '@deps/jest/constants/test-id-constants';

import Popover, { PopoverPlacement } from './popover';
import { getPlacementProps } from './popover.helpers';

import '@testing-library/jest-dom';

const popoverTitle = 'Popover Test';
const popoverBody = 'Popover body test';
const popoverChildTestId = 'popover-child-test-id';
const popoverChild = <p data-testid={popoverChildTestId}>Popover Child Test</p>;

describe('Popover Component', () => {
    it('should correctly display the title', async () => {
        render(
            <Popover
                placement={PopoverPlacement.TopRight}
                title={popoverTitle}
                body={popoverBody}
            >
                {popoverChild}
            </Popover>
        );

        fireEvent.click(screen.getByTestId(PopoverTest.Popover));

        const foundTitle = await screen.findByTestId(PopoverTest.Title);

        expect(foundTitle).toBeInTheDocument();

        expect(foundTitle).toHaveClass('label-lg mb-1');
    });

    it('should correctly display the body', async () => {
        render(
            <Popover
                placement={PopoverPlacement.TopRight}
                title={popoverTitle}
                body={popoverBody}
            >
                {popoverChild}
            </Popover>
        );

        fireEvent.click(screen.getByTestId(PopoverTest.Popover));

        const foundBody = await screen.findByTestId(PopoverTest.Body);

        expect(foundBody).toBeInTheDocument();
        expect(foundBody).toHaveClass('body-sm');
    });

    it('should correctly render the children', () => {
        render(
            <Popover
                placement={PopoverPlacement.TopRight}
                title={popoverTitle}
                body={popoverBody}
            >
                {popoverChild}
            </Popover>
        );

        userEvent.click(screen.getByTestId(PopoverTest.Popover));
        expect(screen.getByTestId(popoverChildTestId)).toBeInTheDocument();
    });

    it('should close the popover when the (x) is clicked', async () => {
        render(
            <Popover
                placement={PopoverPlacement.TopRight}
                title={popoverTitle}
                body={popoverBody}
            >
                {popoverChild}
            </Popover>
        );

        fireEvent.click(screen.getByTestId(PopoverTest.Popover));

        const foundBody = await screen.findByTestId(PopoverTest.Body);

        expect(foundBody).toBeInTheDocument();
        expect(foundBody).toHaveClass('body-sm');

        const popover = await screen.getByTestId(PopoverTest.Popover);
        const svg = await screen.getByTestId(PopoverTest.Cancel);

        expect(popover).toBeInTheDocument();
        expect(svg).toBeInTheDocument();

        fireEvent.click(svg as Element);

        const hiddenPopoverBody = await screen.queryByTestId(PopoverTest.Body);
        expect(hiddenPopoverBody).not.toBeInTheDocument();
    });
});

describe('Popover helpers', () => {
    describe('getPlacementProps', () => {
        it(`returns the right side and align values for ${PopoverPlacement.TopLeft}`, () => {
            const { side, align } = getPlacementProps(PopoverPlacement.TopLeft);

            expect(side).toEqual('top');
            expect(align).toEqual('end');
        });

        it(`returns the right side and align values for ${PopoverPlacement.TopRight}`, () => {
            const { side, align } = getPlacementProps(
                PopoverPlacement.TopRight
            );

            expect(side).toEqual('top');
            expect(align).toEqual('start');
        });

        it(`returns the right side and align values for ${PopoverPlacement.BottomLeft}`, () => {
            const { side, align } = getPlacementProps(
                PopoverPlacement.BottomLeft
            );

            expect(side).toEqual('bottom');
            expect(align).toEqual('end');
        });

        it(`returns the right side and align values for ${PopoverPlacement.BottomRight}`, () => {
            const { side, align } = getPlacementProps(
                PopoverPlacement.BottomRight
            );

            expect(side).toEqual('bottom');
            expect(align).toEqual('start');
        });
    });
});
