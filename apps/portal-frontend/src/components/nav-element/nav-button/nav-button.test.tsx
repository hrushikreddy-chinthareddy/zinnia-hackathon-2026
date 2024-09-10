import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';

import NavButton from './nav-button';

afterEach(cleanup);

describe('NavButton Component', () => {
    it('should render a NavButton component', () => {
        render(<NavButton>NavButton</NavButton>);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render a disabled NavButton', () => {
        render(<NavButton disabled={true}>NavButton</NavButton>);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should render a NavButton with className', () => {
        render(<NavButton className="test-class">NavButton</NavButton>);
        expect(screen.getByRole('button')).toHaveClass('test-class');
    });
});
