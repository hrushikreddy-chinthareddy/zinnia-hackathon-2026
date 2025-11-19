import { render } from '@testing-library/react';
import { browserLogError } from '@deps/utils/browser-logging';

import PendoAnalyticsInit from './PendoAnalyticsInit';

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

    it('calls window.pendo.updateOptions with merged metadata (roles)', () => {
        render(<PendoAnalyticsInit />);

        expect(updateOptionsMock).toHaveBeenCalledTimes(1);

        const options = updateOptionsMock.mock.calls[0][0];

        expect(browserLogError).not.toHaveBeenCalled();
        expect(options.visitor.id).toBe('party:123');
        expect(options.visitor.roles).toEqual([
            'role:zahara_admin',
            'role:zinnia_internal_processor',
        ]);
    });

    it('calls window.pendo.updateOptions with merged metadata (carriers)', () => {
        render(<PendoAnalyticsInit />);

        expect(updateOptionsMock).toHaveBeenCalledTimes(1);

        const options = updateOptionsMock.mock.calls[0][0];

        expect(options.visitor.id).toBe('party:123');
        expect(options.visitor.carrierAccessList).toEqual(['ELIC', 'SBUL']);
    });

    it('logs an error if pendo is not loaded on initialize', () => {
        withPendoMissing(() => {
            render(<PendoAnalyticsInit />);

            expect(initializeMock).not.toHaveBeenCalled();
            expect(browserLogError).toHaveBeenCalledWith(
                'pendo::Pendo not loaded, skipping initialization',
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
        });
    });
});
