import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';

import NavBarLink from './nav-bar-link';

jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        pathname: '/',
    })),
}));

afterEach(cleanup);

describe('NavBarLink Component', () => {
    it('should render a NavBarLink component', () => {
        render(<NavBarLink label={'Case Management'} link={'/'} className="grow" />);
        expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('should render a NavBarLink component without a className', () => {
        render(<NavBarLink label={'Case Management'} link={'/'} />);
        expect(screen.getByRole('link')).toBeInTheDocument();
    });
});
