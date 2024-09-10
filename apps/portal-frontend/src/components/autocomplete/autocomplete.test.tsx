/* eslint-disable @typescript-eslint/no-empty-function */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import Autocomplete from './autocomplete';

window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.HTMLElement.prototype.hasPointerCapture = jest.fn();

// Mock the options
const options = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
];

describe('Autocomplete Component', () => {
    it('renders a Autocomplete component with a label when provided', async () => {
        render(
            <Autocomplete label="Autoselect Label" placeholder="Pick a card, any card" options={options} value={''} onChange={() => null} />
        );

        const label = await screen.findByText('Autoselect Label');
        expect(label).toBeInTheDocument();
    });

    it('renders a Autocomplete component with a placeholder', async () => {
        render(
            <Autocomplete label="Autoselect Label" placeholder="Pick a card, any card" options={options} value={''} onChange={() => null} />
        );

        const placeholder = await screen.findByText('Pick a card, any card');
        expect(placeholder).toBeInTheDocument();
    });

    it('renders a Autocomplete component with an error message', async () => {
        render(
            <Autocomplete
                label="Autoselect Label"
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

    it('renders a Autocomplete component with options', async () => {
        const { getByRole } = render(
            <Autocomplete label="Autoselect Label" options={options} value="" placeholder="Select an option!" onChange={() => {}} />
        );

        // Open the dropdown menu
        await userEvent.click(getByRole('combobox'));
        const option1 = screen.getByText('Option 1');
        const option3 = screen.getByText('Option 3');

        expect(option1).toBeInTheDocument();
        expect(option3).toBeInTheDocument();
    });

    it('selects an Autocomplete option when clicked', async () => {
        const onChange = jest.fn();

        const { getByRole } = render(<Autocomplete label="Autoselect Label" options={options} value="asc" onChange={onChange} />);
        // Open the dropdown menu
        await userEvent.click(getByRole('combobox'));

        const option2 = await screen.findByText('Option 2', { ignore: 'option' });
        userEvent.click(option2);

        waitFor(() => {
            expect(onChange).toHaveBeenCalledWith('option2');
        });
    });

    it('renders the Autocomplete component as disabled', async () => {
        render(<Autocomplete label="Autoselect Label" options={options} value="" onChange={() => {}} disabled />);

        waitFor(() => {
            expect(screen.getByRole('button')).toBeDisabled();
        });
    });

    it('opens the menu when the select is clicked', async () => {
        render(<Autocomplete label="Autoselect Label" options={options} value="option1" onChange={() => {}} />);

        expect(screen.queryByText('Option 2', { ignore: 'option' })).toBeNull();

        userEvent.click(screen.getByText('Option 1', { ignore: 'option' }));

        const option2 = await screen.findByText('Option 2', { ignore: 'option' });
        expect(option2).toBeVisible();
    });

    it('should close the menu when an option is selected', async () => {
        // Render the Autocomplete component
        const { getByRole } = render(<Autocomplete options={options} value="" onChange={() => {}} placeholder="Select an option" />);

        // Open the dropdown menu
        await userEvent.click(getByRole('combobox'));

        const option2 = screen.getByText('Option 2');
        expect(option2).toBeInTheDocument();
        userEvent.click(option2);

        waitFor(() => {
            expect(screen.queryByText('Option 1', { ignore: 'option' })).toBeNull();
        });
    });
});
