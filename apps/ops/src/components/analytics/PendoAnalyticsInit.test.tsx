import { render } from '@testing-library/react';
import { getCookie } from 'cookies-next';

import { browserLogError } from '@deps/utils/browser-logging';

import PendoAnalyticsInit from './PendoAnalyticsInit';

jest.mock('cookies-next', () => ({
    getCookie: jest.fn(),
    setCookie: jest.fn(),
}));

jest.mock('@deps/utils/browser-logging', () => ({
    browserLogError: jest.fn(),
}));

jest.mock('@auth0/nextjs-auth0/client', () => ({
    useUser: () => ({
        user: {
            partyId: 'party:123',
            email: 'user@example.com',
            updated_at: '2024-01-01T00:00:00.000Z',
        },
    }),
}));

jest.mock('@deps/hooks/user-carrier-specific/useUserCarrier', () => ({
    __esModule: true,
    default: () => 'zinnia',
}));

jest.mock('@deps/hooks/tanstack/user/useCarrierListQuery', () => ({
    useCarrierListQuery: () => ({
        data: ['ELIC', 'SBUL'],
    }),
}));

jest.mock('@deps/hooks/tanstack/user/useRoleListQuery', () => ({
    useRoleListQuery: () => ({
        data: ['role:zahara_admin', 'role:zinnia_internal_processor'],
    }),
}));

jest.mock('@deps/helpers/user.helpers', () => ({
    isInternalZinniaUser: () => true,
}));

let originalPendo: typeof window.pendo;
let initializeMock: jest.Mock;
let updateOptionsMock: jest.Mock;

const withPendoMissing = (fn: () => void) => {
    const originalPendo = window.pendo;
    window.pendo = undefined;
    try {
        fn();
    } finally {
        window.pendo = originalPendo;
    }
};

beforeAll(() => {
    originalPendo = window.pendo;
    initializeMock = jest.fn();
    updateOptionsMock = jest.fn();

    // Here we rely on the Window interface from globals.d.ts
    window.pendo = {
        initialize: initializeMock,
        updateOptions: updateOptionsMock,
    };
});

afterAll(() => {
    window.pendo = originalPendo;
});

describe('PendoAnalyticsInit', () => {
    beforeEach(() => {
        (getCookie as jest.Mock).mockReturnValue(
            JSON.stringify({
                admin: ['ELIC', 'SBUL'],
                processor: ['SBUL'],
            })
        );
    });

    afterEach(() => {
        // Reset call counts
        jest.clearAllMocks();
    });

    it('calls window.pendo.initialize with initial options when user and carrier are present', () => {
        render(<PendoAnalyticsInit />);

        // Effect runs after initial render; let React flush effects.
        // If you have fake timers configured globally, you might need act() here.
        expect(initializeMock).toHaveBeenCalledTimes(1);

        const config = initializeMock.mock.calls[0][0];

        expect(browserLogError).not.toHaveBeenCalled();
        expect(config).toMatchObject({
            visitor: {
                id: 'party:123',
                email: 'user@example.com',
                firstLogin: '2024-01-01T00:00:00.000Z',
                // Internal flag comes from isInternalZinniaUser mock
                isInternalZinniaUser: 'true',
            },
            account: {
                id: 'zinnia',
            },
        });
    });

    it('includes roles and carrier metadata in visitor when userRolesMap contains role assignments', () => {
        render(<PendoAnalyticsInit />);

        expect(initializeMock).toHaveBeenCalledTimes(1);
        const config = initializeMock.mock.calls[0][0];

        expect(config).toMatchObject({
            visitor: {
                id: 'party:123',
                email: 'user@example.com',
                firstLogin: '2024-01-01T00:00:00.000Z',
                // Internal flag comes from isInternalZinniaUser mock
                isInternalZinniaUser: 'true',
                roles: ['admin', 'processor'],
                carrierAccessList: ['ELIC', 'SBUL'],
                roleToCarrierMap: [
                    'admin:ELIC',
                    'admin:SBUL',
                    'processor:SBUL',
                ],
            },
            account: {
                id: 'zinnia',
            },
        });
    });

    it('logs an error if pendo is not loaded on initialize', () => {
        withPendoMissing(() => {
            render(<PendoAnalyticsInit />);

            expect(initializeMock).not.toHaveBeenCalled();
            expect(browserLogError).toHaveBeenCalledWith(
                'pendo::Pendo not loaded, skipping initialization',
                { user: 'party:123' }
            );
            expect(browserLogError).toHaveBeenCalledWith(
                'pendo::Pendo not loaded, skipping option update',
                { user: 'party:123' }
            );
        });
    });

    it('logs an error if pendo is not loaded on updateOptions', () => {
        withPendoMissing(() => {
            render(<PendoAnalyticsInit />);

            expect(updateOptionsMock).not.toHaveBeenCalled();
            expect(browserLogError).toHaveBeenCalledWith(
                'pendo::Pendo not loaded, skipping option update',
                { user: 'party:123' }
            );
            expect(browserLogError).toHaveBeenCalledWith(
                'pendo::Pendo not loaded, skipping initialization',
                { user: 'party:123' }
            );
        });
    });
});
