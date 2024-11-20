import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ReactComponent as AcademicCap } from '@deps/styles/elements/icons/icons_outlined/academic-cap.svg';
import { ReactComponent as SparklesIcon } from '@deps/styles/elements/icons/icons_outlined/sparkles.svg';

import SelectComponent from './select'; // Adjust the import path

const options = [
    {
        label: 'Sort: Newest',
        value: 'asc',
    },
    {
        label: 'Sort: Oldest',
        value: 'desc',
    },
];

const multiselectOptions = [
    {
        value: 'option1',
        displayText: 'Option 1',
        label: (
            <>
                <SparklesIcon width={12} height={12} /> Option 1
            </>
        ),
    },
    { value: 'option2', displayText: 'Option 2', label: 'Option 2' },
    {
        value: 'option3',
        displayText: 'Option 3',
        label: (
            <>
                <AcademicCap width={12} height={12} /> Option 3
            </>
        ),
    },
];

describe('Select Component', () => {
    // radix-ui Select component won't open using RTL https://github.com/radix-ui/primitives/issues/1822
    describe.skip('Simple version', () => {
        it('renders a Select component with a label when provided', async () => {
            render(
                <SelectComponent
                    label="Select Label"
                    placeholder="Pick a card, any card"
                    options={options}
                    value={''}
                    onChange={() => null}
                />
            );

            const label = await screen.findByText('Select Label');
            expect(label).toBeInTheDocument();
        });

        it('renders a Select component with a placeholder', async () => {
            render(
                <SelectComponent
                    label="Select Label"
                    placeholder="Pick a card, any card"
                    options={options}
                    value={''}
                    onChange={() => null}
                />
            );

            const placeholder = await screen.findByText('Pick a card, any card');
            expect(placeholder).toBeInTheDocument();
        });

        it('renders a Select component with an error message', async () => {
            render(
                <SelectComponent
                    label="Select Label"
                    placeholder="Pick a card, any card"
                    message="This is an error message"
                    options={options}
                    value={''}
                    onChange={() => null}
                />
            );

            const errorMessage = await screen.findByText('This is an error message');
            expect(errorMessage).toBeInTheDocument();
        });

        it('renders a Select component with options', async () => {
            const button = screen.getByRole('combobox');
            expect(button).toBeInTheDocument();

            await userEvent.click(button);

            // await waitFor(() => expect(screen.getByRole('combobox')).toHaveAttribute('data-state', 'open'))

            // await waitFor(() => expect(screen.getByText('Option 1', { ignore: 'option' })).toBeInTheDocument());

            const option1 = await screen.findByText('Sort: Newest');
            expect(option1).toBeInTheDocument();

            const option2 = await screen.findByText('Option 2', { ignore: 'option' });
            expect(option2).toBeInTheDocument();

            const option3 = await screen.findByText('Option 3', { ignore: 'option' });
            expect(option3).toBeInTheDocument();
        });

        it('selects an option when clicked', async () => {
            const onChange = jest.fn();

            render(<SelectComponent label="Select Label" options={options} value="option1" onChange={onChange} />);

            userEvent.click(screen.getByText('Option 1', { ignore: 'option' }));

            const option2 = await screen.findByText('Option 2', { ignore: 'option' });
            userEvent.click(option2);

            waitFor(() => {
                expect(onChange).toHaveBeenCalledWith('option2');
            });
        });

        it('renders the component as disabled', () => {
            render(<SelectComponent label="Select Label" options={options} value="" onChange={() => {}} disabled={true} />);

            expect(screen.getByRole('button')).toBeDisabled();
        });

        it('opens the menu when the select is clicked', async () => {
            render(<SelectComponent label="Select Label" options={options} value="option1" onChange={() => {}} />);

            expect(screen.queryByText('Option 2', { ignore: 'option' })).toBeNull();

            userEvent.click(screen.getByText('Option 1', { ignore: 'option' }));

            const option2 = await screen.findByText('Option 2', { ignore: 'option' });
            expect(option2).toBeVisible();
        });

        it('closes the menu when an option is selected', async () => {
            render(<SelectComponent label="Select Label" options={options} value="option1" onChange={() => {}} />);

            userEvent.click(screen.getByText('Option 1', { ignore: 'option' }));

            const option2 = await screen.findByText('Option 2', { ignore: 'option' });
            userEvent.click(option2);

            waitFor(() => {
                expect(screen.queryByText('Option 1', { ignore: 'option' })).toBeNull();
            });
        });
    });

    describe('Multiselect version', () => {
        it('renders a Select component with a label when provided', async () => {
            render(
                <SelectComponent
                    label="Select Label"
                    placeholder="Pick a card, any card"
                    options={multiselectOptions}
                    value={{}}
                    onChange={() => null}
                    isMultiselect
                />
            );

            const label = await screen.findByText('Select Label');
            expect(label).toBeInTheDocument();
        });

        it('renders a Select component with a placeholder', async () => {
            render(
                <SelectComponent
                    label="Select Label"
                    placeholder="Pick a card, any card"
                    options={multiselectOptions}
                    value={{}}
                    onChange={() => null}
                    isMultiselect
                />
            );

            const placeholder = await screen.findByText('Pick a card, any card');
            expect(placeholder).toBeInTheDocument();
        });

        it('renders a Select component with options', async () => {
            render(<SelectComponent label="Select Label" options={multiselectOptions} value={{}} onChange={() => null} isMultiselect />);

            const select = screen.getByRole('button');
            expect(select).toBeInTheDocument();

            userEvent.click(select);
            const option1 = await screen.findByText('Option 1');
            expect(option1).toBeInTheDocument();

            const option2 = await screen.findByText('Option 2');
            expect(option2).toBeInTheDocument();

            const option3 = await screen.findByText('Option 3');
            expect(option3).toBeInTheDocument();
        });

        it('opens the menu when the select with current value populated is clicked', async () => {
            render(
                <SelectComponent
                    label="Select Label"
                    options={multiselectOptions}
                    value={{ option1: 'Option 1' }}
                    onChange={() => null}
                    isMultiselect
                />
            );

            expect(screen.queryByText('Option 2', { ignore: 'option' })).toBeNull();

            userEvent.click(screen.getByText('Option 1', { ignore: 'option' }));

            const option2 = await screen.findByText('Option 2', { ignore: 'option' });
            expect(option2).toBeVisible();
        });

        it('opens the menu when the select with current value with multiple selected is clicked', async () => {
            render(
                <SelectComponent
                    label="Select Label"
                    options={multiselectOptions}
                    value={{ option1: 'Option 1', option2: 'Option 2' }}
                    onChange={() => null}
                    isMultiselect
                />
            );

            expect(screen.queryByText('Option 1', { ignore: 'option' })).toBeNull();
            expect(screen.queryByText('Option 2', { ignore: 'option' })).toBeNull();
            expect(screen.queryByText('Option 3', { ignore: 'option' })).toBeNull();

            userEvent.click(screen.getByText('Option 1, Option 2', { ignore: 'option' }));

            const option3 = await screen.findByText('Option 3', { ignore: 'option' });
            expect(option3).toBeVisible();
        });

        it('displays an error message', () => {
            render(
                <SelectComponent
                    label="Select Label"
                    options={multiselectOptions}
                    value={{}}
                    onChange={() => null}
                    message="This is an error message"
                    isMultiselect
                />
            );

            expect(screen.getByText('This is an error message')).toBeInTheDocument();
        });

        it('selects an option when clicked', async () => {
            const onChange = jest.fn();

            render(<SelectComponent label="Select Label" options={multiselectOptions} value={{}} onChange={onChange} isMultiselect />);

            const select = screen.getByRole('button');
            expect(select).toBeInTheDocument();

            userEvent.click(select);

            const option3 = await screen.findByText('Option 3', { ignore: 'option' });
            userEvent.click(option3);

            await waitFor(() => {
                expect(onChange).toHaveBeenCalledWith('option3', 'Option 3', true);
                expect(onChange).toHaveBeenCalledTimes(1);
            });
        });

        it.skip('closes the menu when esc is pressed', async () => {
            render(
                <SelectComponent
                    label="Select Label"
                    options={multiselectOptions}
                    value={{ option1: 'Option 1' }}
                    onChange={() => null}
                    isMultiselect
                />
            );

            expect(screen.queryByText('Option 2', { ignore: 'option' })).toBeNull();
            expect(screen.queryByText('Option 3', { ignore: 'option' })).toBeNull();

            userEvent.click(screen.getByText('Option 1', { ignore: 'option' }));

            const option2 = await screen.findByText('Option 2', { ignore: 'option' });
            expect(option2).toBeInTheDocument();

            const option3 = await screen.findByText('Option 3', { ignore: 'option' });
            expect(option3).toBeInTheDocument();

            userEvent.click(option3);

            const option2afterOption = await screen.findByText('Option 2', { ignore: 'option' });
            expect(option2afterOption).toBeInTheDocument();

            const option3afterOption = await screen.findByText('Option 3', { ignore: 'option' });
            expect(option3afterOption).toBeInTheDocument();

            userEvent.keyboard('{esc}');

            waitFor(() => {
                expect(screen.queryByText('Option 2', { ignore: 'option' })).toBeNull();
                expect(screen.queryByText('Option 3', { ignore: 'option' })).toBeNull();
            });
        });
    });
});
