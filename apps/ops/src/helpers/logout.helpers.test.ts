import { cleanup } from '@testing-library/react';

import { serverSidePropsLogout } from './logout.helpers';

jest.mock('cookies-next', () => ({
    setCookie: jest.fn(),
}));

describe('helpers/logout.helpers', () => {
    const { setCookie } = jest.requireMock('cookies-next');

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    it('sets zlSessionTimeout cookie with correct options', () => {
        const result = serverSidePropsLogout();
        expect(setCookie).toHaveBeenCalledTimes(1);
        expect(setCookie).toHaveBeenCalledWith('zlSessionTimeout', true, {
            maxAge: 60 * 60 * 24,
            path: '/',
        });
        expect(result).toBeDefined();
    });

    it('returns redirect response to /api/auth/logout and permanent=false', () => {
        const result = serverSidePropsLogout();
        expect(result).toEqual({
            redirect: {
                destination: '/api/auth/logout',
                permanent: false,
            },
        });
    });
});
