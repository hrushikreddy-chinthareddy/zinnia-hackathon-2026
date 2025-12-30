import { cleanup } from '@testing-library/react';

import { formatValidationResult } from './bpm-transaction.helpers';

describe('helpers/bpm-transaction.helpers', () => {
    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    it('returns fallback when result is undefined or empty', () => {
        expect(formatValidationResult(undefined as any)).toBe('Unknown issue');
        expect(formatValidationResult([] as any)).toBe('Unknown issue');
    });

    it('joins error and resolution messages from array', () => {
        const input = [
            { error: 'E1', resolution: 'Fix1' },
            { error: 'E2', resolution: 'Fix2' },
        ] as any;
        expect(formatValidationResult(input)).toBe('E1 Fix1 E2 Fix2');
    });
});
