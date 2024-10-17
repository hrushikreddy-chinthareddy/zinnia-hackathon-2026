import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';

import { Statuses } from '@deps/models/case/case';

import ChipStatus from './chip-status';

afterEach(cleanup);

describe('ChipStatus Component', () => {
    const renderChipStatus = (status: Statuses) => {
        render(<ChipStatus status={status} />);
        return screen.getByTestId('chip-status');
    };

    it('should render In Progress chip with correct colors', () => {
        const chip = renderChipStatus(Statuses.InProgress);
        expect(chip).toHaveStyle('color: var(--color-semantic-information)');
        expect(chip).toHaveStyle('background-color: var(--color-semantic-information-light)');
        expect(chip).toHaveTextContent('Inprogress');
    });

    it('should render Exception chip with correct colors', () => {
        const chip = renderChipStatus(Statuses.Exception);
        expect(chip).toHaveStyle('color: var(--color-semantic-error)');
        expect(chip).toHaveStyle('background-color: var(--color-semantic-error-light)');
        expect(chip).toHaveTextContent('Exception');
    });

    it('should render Completed chip with correct colors', () => {
        const chip = renderChipStatus(Statuses.Completed);
        expect(chip).toHaveStyle('color: var(--color-semantic-success)');
        expect(chip).toHaveStyle('background-color: var(--color-semantic-success-light)');
        expect(chip).toHaveTextContent('Completed');
    });

    it('should render Not Started chip with correct colors', () => {
        const chip = renderChipStatus(Statuses.NotStarted);
        expect(chip).toHaveStyle('color: var(--color-900-gray)');
        expect(chip).toHaveStyle('background-color: var(--color-50-gray)');
        expect(chip).toHaveTextContent('Notstarted');
    });
});
