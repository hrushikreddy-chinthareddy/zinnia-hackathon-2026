import * as Checkbox from '@radix-ui/react-checkbox';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';

import { sleep } from '@deps/utils/storybook';

type StoryType = StoryObj<Checkbox.CheckboxProps>;

const meta: Meta<StoryType> = {
    title: 'Components/Chip/Select',
    parameters: {
        controls: {
            hideNoControlsWarning: true,
        },
    },
};

export default meta;

export const Multi: StoryObj<typeof Checkbox.Root> = {
    render: () => (
        <form className="default-focus-within flex gap-5">
            <Checkbox.Root className="chip" name="chip" value="chip-1">
                chip 1
            </Checkbox.Root>
            <Checkbox.Root className="chip" name="chip" value="chip-2">
                chip 2
            </Checkbox.Root>
            <Checkbox.Root className="chip" name="chip" value="chip-3">
                chip 3
            </Checkbox.Root>
            <Checkbox.Root className="chip" name="chip" value="chip-4">
                chip 4
            </Checkbox.Root>
            <Checkbox.Root className="chip" name="chip" value="chip-5">
                chip 5
            </Checkbox.Root>
        </form>
    ),
    play: async ({ canvasElement, step }) => {
        await sleep(0);
        const canvas = within(canvasElement);

        await step('keyboard navigation', async () => {
            await step('tab interaction', async () => {
                await sleep(0);
                const testChip = async (n: number) =>
                    await step(`chip ${n}`, async () => {
                        const chip = await canvas.findByRole('checkbox', {
                            name: `chip ${n}`,
                        });

                        await userEvent.tab();
                        await expect(chip).toHaveFocus();

                        await userEvent.keyboard('{space}');
                        await expect(chip).toBeChecked();

                        await sleep(0);
                    });
                await testChip(1);
                await testChip(2);
                await testChip(3);
                await testChip(4);
                await testChip(5);

                await userEvent.tab();
                await expect(document.activeElement).not.toHaveAttribute(
                    'role',
                    'checkbox'
                );

                const checkedChips = await canvas.findAllByRole('checkbox', {
                    checked: true,
                });
                await expect(checkedChips).toHaveLength(5);
            });
            await step(`shift+tab interaction`, async () => {
                await sleep(0);
                const testChip = async (n: number) =>
                    await step(`chip ${n}`, async () => {
                        const chip = await canvas.findByRole('checkbox', {
                            name: `chip ${n}`,
                        });

                        await userEvent.tab({ shift: true });
                        await expect(chip).toBeChecked();
                        await userEvent.keyboard('{space}');
                        await expect(chip).not.toBeChecked();
                        await sleep(0);
                    });

                await testChip(5);
                await testChip(4);
                await testChip(3);
                await testChip(2);
                await testChip(1);

                // no chips should be checked
                const uncheckedChips = await canvas.findAllByRole('checkbox', {
                    checked: false,
                });
                await expect(uncheckedChips).toHaveLength(5);
            });
        });
    },
};

export const Single: StoryObj<typeof RadioGroup.Root> = {
    render: () => (
        <form className="default-focus-within">
            <RadioGroup.Root
                className="flex gap-5"
                name="chips"
                defaultValue="default"
                aria-label="chips"
            >
                <RadioGroup.Item className="chip" value="chip-1">
                    chip 1
                </RadioGroup.Item>
                <RadioGroup.Item className="chip" value="chip-2">
                    chip 2
                </RadioGroup.Item>
                <RadioGroup.Item className="chip" value="chip-3">
                    chip 3
                </RadioGroup.Item>
                <RadioGroup.Item className="chip" value="chip-4">
                    chip 4
                </RadioGroup.Item>
                <RadioGroup.Item className="chip" value="chip-5">
                    chip 5
                </RadioGroup.Item>
            </RadioGroup.Root>
        </form>
    ),
    play: async ({ canvasElement, step }) => {
        await sleep(0);
        const canvas = within(canvasElement);

        // test chip
        const testChip = async (n: number, direction: 'left' | 'right') =>
            await step(`chip ${n}`, async () => {
                const chip = await canvas.findByRole('radio', {
                    name: `chip ${n}`,
                });
                // chip should be focused and checked
                await expect(chip).toHaveFocus();
                await expect(chip).not.toBeChecked();
                // spcebar should check the chip
                await userEvent.keyboard('{space}');
                await expect(chip).toBeChecked();
                await userEvent.keyboard(`{arrow${direction}}`);
                await sleep(0);
            });

        await step('keyboard navigation', async () => {
            await step('tab interaction', async () => {
                await sleep(0);
                await userEvent.tab();
                await expect(document.activeElement).toHaveAttribute(
                    'role',
                    'radio'
                );
                await userEvent.tab();
                await expect(document.activeElement).not.toHaveAttribute(
                    'role',
                    'radio'
                );
                await userEvent.tab({ shift: true });
                await expect(document.activeElement).toHaveAttribute(
                    'role',
                    'radio'
                );
            });
            await step(`right arrow interaction`, async () => {
                await sleep(0);
                await testChip(1, 'right');
                await testChip(2, 'right');
                await testChip(3, 'right');
                await testChip(4, 'right');
                await testChip(5, 'right');
            });
            await step(`left arrow interaction`, async () => {
                await sleep(0);
                // make sure we can loop around
                // and then go back to the last chip
                await testChip(1, 'left');
                await testChip(5, 'left');
                await testChip(4, 'left');
                await testChip(3, 'left');
                await testChip(2, 'left');
                await testChip(1, 'left');
            });
        });
    },
};
