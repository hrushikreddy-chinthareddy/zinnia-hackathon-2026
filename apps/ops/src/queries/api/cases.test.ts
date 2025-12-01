// apps/ops/src/queries/api/cases.test.ts

import { AxiosResponse } from 'axios';

import { isMockCaseDetailsRequestEnabled } from '@deps/services/api-config';
import { mockCaseDetails } from '@deps/services/mocks/case-details';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { caseSanitizer } from '@deps/utils/sanitizers';
import { logInfo, logError, logWarn } from '@deps/utils/server-logging';

import { getCaseDetailsSSR } from './cases';
import { serverApi } from '../api-utils/serverApiClient';

jest.mock('../api-utils/serverApiClient', () => ({
    serverApi: {
        get: jest.fn(),
    },
}));

jest.mock('@deps/services/api-config', () => ({
    isMockCaseDetailsRequestEnabled: jest.fn(),
}));

jest.mock('@deps/utils/sanitizers', () => ({
    caseSanitizer: jest.fn((data) => data),
}));

jest.mock('@deps/utils/server-logging', () => ({
    logInfo: jest.fn(),
    logError: jest.fn(),
    logWarn: jest.fn(),
    parseErrorInformation: jest.fn(() => ({ parsed: true })),
}));

const mockedLogInfo = logInfo as jest.MockedFunction<typeof logInfo>;
const mockedLogError = logError as jest.MockedFunction<typeof logError>;
const mockedLogWarn = logWarn as jest.MockedFunction<typeof logWarn>;

jest.mock('@deps/services/mocks/case-details', () => ({
    mockCaseDetails: { id: 'mock-case-id' },
}));

const mockedServerGet = serverApi.get as jest.MockedFunction<
    typeof serverApi.get
>;
const mockedIsMockCaseDetailsRequestEnabled =
    isMockCaseDetailsRequestEnabled as jest.MockedFunction<
        typeof isMockCaseDetailsRequestEnabled
    >;
const mockedCaseSanitizer = caseSanitizer as jest.MockedFunction<
    typeof caseSanitizer
>;

describe('getCaseDetailsSSR', () => {
    const id = 'case-id-123';
    const accessToken = 'test-token';
    const loggingContext = { correlationId: 'corr-id-1' } as any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedIsMockCaseDetailsRequestEnabled.mockReturnValue(false);
    });

    it('returns mockCaseDetails when isMockCaseDetailsRequestEnabled is true', async () => {
        mockedIsMockCaseDetailsRequestEnabled.mockReturnValue(true);

        const result = await getCaseDetailsSSR(
            id,
            accessToken,
            loggingContext,
            {}
        );

        expect(result).toEqual(mockCaseDetails);
        expect(mockedServerGet).not.toHaveBeenCalled();
        expect(mockedLogInfo).not.toHaveBeenCalled();
    });

    it('calls serverApi.get with v1 URL when CASE_DETAILS_V2 flag is false', async () => {
        const apiResponse = { id: 'from-api' } as any;
        mockedServerGet.mockResolvedValue({
            data: apiResponse,
        } as AxiosResponse);
        const featureFlags = {
            [FEATURE_FLAGS.CASE_DETAILS_V2]: false,
        } as any;

        const result = await getCaseDetailsSSR(
            id,
            accessToken,
            loggingContext,
            featureFlags
        );

        expect(mockedIsMockCaseDetailsRequestEnabled).toHaveBeenCalled();
        expect(mockedServerGet).toHaveBeenCalledTimes(1);

        const [url, options, ctx] = mockedServerGet.mock.calls[0];
        expect(url).toContain('/case/v1/cases/');
        expect(url).toContain(id);
        expect(options.authorization).toBe(`Bearer ${accessToken}`);
        expect(ctx).toBe(loggingContext);

        expect(mockedCaseSanitizer).toHaveBeenCalledWith(apiResponse);
        expect(result).toBe(apiResponse);

        expect(mockedLogInfo).toHaveBeenCalledWith(
            'getCaseDetailsSSR',
            expect.objectContaining({
                file: 'queries/api/cases',
                function: 'getCaseDetailsSSR',
                url,
            })
        );
    });

    it('uses v2 URL when CASE_DETAILS_V2 flag is true', async () => {
        mockedServerGet.mockResolvedValue({
            data: {},
        } as AxiosResponse);
        const featureFlags = {
            [FEATURE_FLAGS.CASE_DETAILS_V2]: true,
        } as any;

        await getCaseDetailsSSR(id, accessToken, loggingContext, featureFlags);

        const [url] = mockedServerGet.mock.calls[0];
        expect(url).toContain('/case/v2/cases/');
        expect(url).toContain(id);
    });

    it('logs with logWarn on 403 error and returns null', async () => {
        const error = { status: 403 };
        mockedServerGet.mockRejectedValue(error as any);

        const result = await getCaseDetailsSSR(
            id,
            accessToken,
            loggingContext,
            {}
        );

        expect(result).toBeNull();
        expect(mockedLogWarn).toHaveBeenCalledWith(
            'getCaseDetailsSSR',
            expect.objectContaining({
                file: 'queries/api/cases',
                function: 'getCaseDetailsSSR',
            })
        );
        expect(mockedLogError).not.toHaveBeenCalled();
    });

    it('logs with logInfo on 404 error and returns null', async () => {
        const error = { status: 404 };
        mockedServerGet.mockRejectedValue(error as any);

        const result = await getCaseDetailsSSR(
            id,
            accessToken,
            loggingContext,
            {}
        );

        expect(result).toBeNull();
        expect(mockedLogInfo).toHaveBeenCalledWith(
            'getCaseDetailsSSR',
            expect.objectContaining({
                file: 'queries/api/cases',
                function: 'getCaseDetailsSSR',
            })
        );
        expect(mockedLogError).not.toHaveBeenCalled();
        expect(mockedLogWarn).not.toHaveBeenCalled();
    });

    it('logs with logError on non-403/404 error and returns null', async () => {
        const error = { status: 500 };
        mockedServerGet.mockRejectedValue(error as any);

        const result = await getCaseDetailsSSR(
            id,
            accessToken,
            loggingContext,
            {}
        );

        expect(result).toBeNull();
        expect(mockedLogError).toHaveBeenCalledWith(
            'getCaseDetailsSSR',
            expect.objectContaining({
                file: 'queries/api/cases',
                function: 'getCaseDetailsSSR',
            })
        );
        expect(mockedLogWarn).not.toHaveBeenCalled();
    });
});
