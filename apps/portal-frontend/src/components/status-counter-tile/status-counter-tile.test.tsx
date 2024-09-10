import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { Statuses } from '@deps/models/case/case';

import StatusCounterTile from './status-counter-tile';

describe('StatusCounterTile', () => {
    it('renders a custom label', () => {
        render(<StatusCounterTile count={212} />);
        expect(screen.getByText('caseManagementDashboard.statusFilters.all')).toBeInTheDocument();
        expect(screen.getByText('212')).toBeInTheDocument();
        expect(screen.getByText('caseManagementDashboard.statusFilters.cases')).toBeInTheDocument();
    });

    it('renders status chip when status is provided', () => {
        render(<StatusCounterTile count={212} status={Statuses.InProgress} />);
        const mainContainer = screen.getByTestId('status-counter-tile');
        expect(screen.getByTestId('chip-status')).toBeInTheDocument();
        expect(screen.getByText('212')).toBeInTheDocument();
        expect(screen.getByText('caseManagementDashboard.statusFilters.cases')).toBeInTheDocument();
        expect(mainContainer).toHaveClass('border-transparent');
    });

    it('renders InProgress status', () => {
        render(<StatusCounterTile count={212} status={Statuses.InProgress} />);
        expect(screen.getByTestId('chip-status')).toHaveTextContent('Status.inprogress');
    });

    it('renders Exception status', () => {
        render(<StatusCounterTile count={212} status={Statuses.Exception} />);
        expect(screen.getByTestId('chip-status')).toHaveTextContent('Status.exception');
    });

    it('renders with selected border when isSelected is true', () => {
        render(<StatusCounterTile count={212} isSelected={true} />);
        const mainContainer = screen.getByTestId('status-counter-tile');
        expect(mainContainer).toHaveClass('border-primary border-2');
        expect(mainContainer).not.toHaveClass('border-transparent');
    });

    it('restores original border when the mouse leaves the tile', () => {
        render(<StatusCounterTile count={212} isActive={true} />);
        const mainContainer = screen.getByTestId('status-counter-tile');
        fireEvent.mouseEnter(mainContainer);
        fireEvent.mouseLeave(mainContainer);
        expect(mainContainer).not.toHaveClass('border-accent-1 border-1');
    });

    it('displays count with comma when count is over 9000', () => {
        render(<StatusCounterTile count={9001} />);
        expect(screen.getByText('9,001')).toBeInTheDocument();
    });

    it('calls onClick prop when the tile is clicked', () => {
        const handleClick = jest.fn();
        render(<StatusCounterTile count={212} onClick={handleClick} />);
        const mainContainer = screen.getByTestId('status-counter-tile');
        fireEvent.click(mainContainer);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
