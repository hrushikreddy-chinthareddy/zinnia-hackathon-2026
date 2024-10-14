import '@testing-library/jest-dom';
import { cleanup, render, fireEvent } from '@testing-library/react';

import { ArrowLeft, ArrowRight } from './arrows';

afterEach(cleanup);

describe('ArrowLeft component', () => {
    it('should render without crashing', () => {
        const onClick = jest.fn();
        const { getByTestId } = render(<ArrowLeft disabled={false} onClick={onClick} />);
        expect(getByTestId('arrow-left')).toBeInTheDocument();
    });

    it('should call onClick when clicked', () => {
        const onClick = jest.fn();
        const { getByTestId } = render(<ArrowLeft disabled={false} onClick={onClick} />);
        fireEvent.click(getByTestId('arrow-left'));
        expect(onClick).toHaveBeenCalled();
    });

    it('should not call onClick when clicked while disabled', () => {
        const onClick = jest.fn();
        const { getByTestId } = render(<ArrowLeft disabled={true} onClick={onClick} />);
        fireEvent.click(getByTestId('arrow-left'));
        expect(onClick).not.toHaveBeenCalled();
    });
});

describe('ArrowRight component', () => {
    it('should render without crashing', () => {
        const onClick = jest.fn();
        const { getByTestId } = render(<ArrowRight disabled={false} onClick={onClick} />);
        expect(getByTestId('arrow-right')).toBeInTheDocument();
    });

    it('should call onClick when clicked', () => {
        const onClick = jest.fn();
        const { getByTestId } = render(<ArrowRight disabled={false} onClick={onClick} />);
        fireEvent.click(getByTestId('arrow-right'));
        expect(onClick).toHaveBeenCalled();
    });

    it('should not call onClick when clicked while disabled', () => {
        const onClick = jest.fn();
        const { getByTestId } = render(<ArrowRight disabled={true} onClick={onClick} />);
        fireEvent.click(getByTestId('arrow-right'));
        expect(onClick).not.toHaveBeenCalled();
    });
});
