import '@testing-library/jest-dom';
import { cleanup, fireEvent, render } from '@testing-library/react';

import PageNumber from './page-numbers';

afterEach(cleanup);

describe('PageNumber', () => {
    const pageNumber = 2;
    const currentPage = 1;
    const onClick = jest.fn();

    it('should render a clickable page number when not selected', () => {
        const { getByTestId } = render(<PageNumber pageNumber={pageNumber} currentPage={currentPage} onClick={onClick} />);

        const button = getByTestId('page-number');
        expect(button).toBeInTheDocument();
        expect(button).toBeEnabled();

        fireEvent.click(button);
        expect(onClick).toHaveBeenCalledWith(pageNumber);
    });

    it('should render a non-clickable page number when selected', () => {
        const { getByTestId } = render(<PageNumber pageNumber={currentPage} currentPage={currentPage} onClick={onClick} />);

        const button = getByTestId('page-number');
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
    });

    it('should have correct styles when not selected', () => {
        const { getByTestId } = render(<PageNumber pageNumber={pageNumber} currentPage={currentPage} onClick={onClick} />);

        const button = getByTestId('page-number');
        expect(button).toHaveClass('text-label-lg');
        expect(button).toHaveClass('font-medium');
        expect(button).not.toHaveClass('border-2');
        expect(button).not.toHaveClass('bg-secondary-lightest');
    });

    it('should have correct styles when selected', () => {
        const { getByTestId } = render(<PageNumber pageNumber={currentPage} currentPage={currentPage} onClick={onClick} />);

        const button = getByTestId('page-number');
        expect(button).toHaveClass('text-label-lg');
        expect(button).toHaveClass('active:font-semibold');
        expect(button).toHaveClass(
            'border-2 !outline-secondary outline-offset-0 !bg-secondary-lightest !border-secondary pointer-events-none rounded-[3px]'
        );
        expect(button).toHaveClass('!bg-secondary-lightest');
    });
});
