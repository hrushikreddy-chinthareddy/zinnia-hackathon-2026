import { renderHook, waitFor } from '@testing-library/react';

import { getPolicyNotesInfo } from '@deps/queries/api/policies';

import { useDiaryNotes } from './useDiaryNotes';

jest.mock('@deps/queries/api/policies');

jest.mock('@deps/utils/server-logging');

describe('useDiaryNotes', () => {
    it('should fetch diary notes on initial render', async () => {
        const policyNumber = '123';
        const clientCode = 'abc';
        const offset = 0;
        const limit = 10;

        const mockData = {
            Items: [{ note: 'Test note' }],
            Count: 1,
        };

        jest.mock('@deps/queries/api/policies', () => ({
            getPolicyNotesInfo: jest.fn(),
        }));

        (getPolicyNotesInfo as jest.Mock).mockResolvedValueOnce(mockData);

        const { result } = renderHook(() => useDiaryNotes(policyNumber, clientCode, offset, limit));

        await waitFor(() => expect(result.current.diaryNotes).toEqual(mockData.Items));

        expect(result.current.totalLogs).toBe(mockData.Count);
    });

    it('should handle error when no policy number or client code provided', async () => {
        const policyNumber = '';
        const clientCode = '';
        const offset = 0;
        const limit = 10;

        jest.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderHook(() => useDiaryNotes(policyNumber, clientCode, offset, limit));

        expect(result.current.isLoading).toBe(false);
        expect(result.current.diaryNotes).toEqual([]);
        expect(result.current.totalLogs).toBe(0);

        expect(console.error).toHaveBeenCalledWith('No policy number or client code provided');
    });
});
