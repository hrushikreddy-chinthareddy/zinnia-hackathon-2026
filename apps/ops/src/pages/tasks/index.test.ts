import {
    extractTaskListingParamsFromRolesMap,
    isAdminFromUserRolesMap,
} from './index';

jest.mock('@deps/utils/optimizely/optimizely', () => ({
    optimizelyService: {
        getFeatureFlagDecisions: jest.fn(),
    },
}));

jest.mock('@deps/utils/optimizely/flags', () => ({
    FEATURE_FLAGS: {
        OPS_MANAGER_FEATURE: 'OPS_MANAGER_FEATURE',
    },
}));

jest.mock('@deps/components/page-title', () => ({
    PageHead: () => null,
}));

jest.mock('@deps/components/typography/typography', () => {
    const Typography = () => null;
    return {
        __esModule: true,
        default: Typography,
        TypographyVariant: {
            H1: 'H1',
        },
    };
});

jest.mock(
    '@deps/containers/task-management-queue/task-management-queue-container',
    () => {
        const TaskManagementQueue = () => null;
        return {
            __esModule: true,
            default: TaskManagementQueue,
        };
    }
);

describe('tasks/index helpers', () => {
    describe('isAdminFromUserRolesMap', () => {
        it('returns false when roles map is undefined', () => {
            expect(isAdminFromUserRolesMap(undefined)).toBe(false);
        });

        it('returns true when any role key includes admin role', () => {
            expect(
                isAdminFromUserRolesMap({
                    admin: ['ABC'],
                })
            ).toBe(true);

            expect(
                isAdminFromUserRolesMap({
                    something_admin_like: ['ABC'],
                })
            ).toBe(true);
        });

        it('returns false when no role keys include admin role', () => {
            expect(
                isAdminFromUserRolesMap({
                    processor: ['ABC'],
                    something_else: ['DEF'],
                })
            ).toBe(false);
        });
    });

    describe('extractTaskListingParamsFromTuples', () => {
        it('returns empty carriers and queues when no queue_admin roles are present', () => {
            expect(
                extractTaskListingParamsFromRolesMap({
                    admin: ['ABC'],
                    processor: ['DEF'],
                })
            ).toEqual({ carriers: [], queues: [] });
        });

        it('extracts carriers and queue names from *_queue_admin keys', () => {
            expect(
                extractTaskListingParamsFromRolesMap({
                    claims_queue_admin: ['abc', 'def'],
                })
            ).toEqual({
                carriers: ['ABC', 'DEF'],
                queues: ['claims'],
            });
        });

        it('dedupes carriers and queues across multiple queue_admin roles', () => {
            const result = extractTaskListingParamsFromRolesMap({
                claims_queue_admin: ['abc', 'abc', 'def'],
                billing_queue_admin: ['def', 'ghi'],
                // should be ignored
                admin: ['zzz'],
            });

            expect(new Set(result.carriers)).toEqual(
                new Set(['ABC', 'DEF', 'GHI'])
            );
            expect(new Set(result.queues)).toEqual(
                new Set(['claims', 'billing'])
            );
        });
    });
});
