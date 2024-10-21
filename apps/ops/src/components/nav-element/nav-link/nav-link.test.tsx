import { fireEvent , cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import NavLink from './nav-link';

afterEach(cleanup);

describe('NavLink Component', () => {
    it('should render a NavLink component', () => {
        render(<NavLink>NavLink</NavLink>);
        expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('should render a NavLink component with href', () => {
        render(<NavLink href="/test">NavLink</NavLink>);
        expect(screen.getByRole('link')).toHaveAttribute('href', '/test');
    });

    it('should call onClick when clicked', () => {
        const handleClick = jest.fn();
        render(<NavLink onClick={handleClick}>NavLink</NavLink>);
        fireEvent.click(screen.getByRole('link'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onFocus when focused', () => {
        const handleFocus = jest.fn();
        render(<NavLink onFocus={handleFocus}>NavLink</NavLink>);
        fireEvent.focus(screen.getByRole('link'));
        expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should call onBlur when blurred', () => {
        const handleBlur = jest.fn();
        render(<NavLink onBlur={handleBlur}>NavLink</NavLink>);
        fireEvent.blur(screen.getByRole('link'));
        expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should render a NavLink with className', () => {
        render(<NavLink className="test-class">NavLink</NavLink>);
        expect(screen.getByRole('link')).toHaveClass('test-class');
    });
});
