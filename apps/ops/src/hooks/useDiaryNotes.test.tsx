import { renderHook, waitFor } from '@testing-library/react';

import { useDiaryNotes } from './useDiaryNotes';

jest.mock('@deps/queries/api/policies', () => ({
    getPolicyNotesInfo: jest.fn(),
}));
jest.mock('@deps/models/case/withdrawal/case', () => ({
    DairyNoteType: {
        POLICYISSUED: 'Policy Issued',
        ADMINISTRATIVE: 'Administrative',
    },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getPolicyNotesInfo } = require('@deps/queries/api/policies');

const mockFASTNotes = [
    {
        type: 'POLICYISSUED',
        alertIndicator: true,
        createdDate: '2023-10-15T00:00:00Z',
        message: 'Past note',
    },
    {
        type: 'ADMINISTRATIVE',
        alertIndicator: false,
        createdDate: '2023-10-10T00:00:00Z',
        message: 'Older note',
    },
];

describe('useDiaryNotes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('loads and maps FAST and LC notes correctly', async () => {
        getPolicyNotesInfo.mockResolvedValueOnce(mockFASTNotes);
        const { result } = renderHook(() =>
            useDiaryNotes({
                policyNumber: '123',
                showDiaryNotes: true,
                planCode: '1234',
            })
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.diaryNotes.length).toBe(2);
        expect(result.current.totalLogs).toBe(2);
        expect(result.current.diaryNotes[0].NoteText).toBe('Past note');
        expect(result.current.diaryNotes[1].NoteText).toBe('Older note');
    });

    it('handles missing policyNumber/clientCode gracefully', async () => {
        const errorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});
        const { result } = renderHook(() =>
            useDiaryNotes({
                policyNumber: '',
                showDiaryNotes: true,
                planCode: '1234',
            })
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.diaryNotes.length).toBe(0);
        errorSpy.mockRestore();
    });

    it('does not fetch notes when showDiaryNotes is false', async () => {
        getPolicyNotesInfo.mockResolvedValueOnce(mockFASTNotes);
        const { result } = renderHook(() =>
            useDiaryNotes({
                policyNumber: '123',
                showDiaryNotes: false,
                planCode: '1234',
            })
        );
        // Wait a tick to ensure useEffect runs
        await waitFor(() => true);
        expect(getPolicyNotesInfo).not.toHaveBeenCalled();
        expect(result.current.diaryNotes.length).toBe(0);
        expect(result.current.isLoading).toBe(true); // stays true since fetch not triggered
    });

    it('refetches notes when parameters change', async () => {
        getPolicyNotesInfo.mockResolvedValue(mockFASTNotes);
        const { result, rerender } = renderHook(
            ({ policyNumber }) =>
                useDiaryNotes({
                    policyNumber: policyNumber,
                    showDiaryNotes: true,
                    planCode: '1234',
                }),
            { initialProps: { policyNumber: '123', planCode: '1234' } }
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(getPolicyNotesInfo).toHaveBeenCalledWith(
            expect.objectContaining({ planCode: '1234', policyNumber: '123' })
        );
        rerender({ policyNumber: 'PN999', planCode: '1234' });
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(getPolicyNotesInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                policyNumber: 'PN999',
                planCode: '1234',
            })
        );
    });

    it('passes planCode correctly to getPolicyNotesInfo', async () => {
        getPolicyNotesInfo.mockResolvedValueOnce(mockFASTNotes);
        const { result } = renderHook(() =>
            useDiaryNotes({
                policyNumber: '123',
                showDiaryNotes: true,
                planCode: 'PLANX',
            })
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(getPolicyNotesInfo).toHaveBeenCalledWith(
            expect.objectContaining({ planCode: 'PLANX' })
        );
    });
});
