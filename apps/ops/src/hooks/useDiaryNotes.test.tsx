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
        createdDate: '2025-10-15T00:00:00Z',
        message: 'Future note',
    },
    {
        type: 'ADMINISTRATIVE',
        alertIndicator: false,
        createdDate: '2025-10-10T00:00:00Z',
        message: 'Past note',
    },
];

const mockLCNotes = {
    Items: [
        { NoteDate: '2025-10-15T00:00:00Z', NoteText: 'Future note' },
        { NoteDate: '2025-10-10T00:00:00Z', NoteText: 'Past note' },
    ],
    Count: 2,
};

describe('useDiaryNotes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('loads and maps FAST notes correctly', async () => {
        getPolicyNotesInfo.mockResolvedValueOnce(mockFASTNotes);
        const { result } = renderHook(() =>
            useDiaryNotes({
                policyNumber: '123',
                clientCode: 'FLIC',
                offset: 0,
                limit: 10,
                showDiaryNotes: true,
                planCode: '1234',
                isLC: false,
            })
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.diaryNotes.length).toBe(2);
        expect(result.current.totalLogs).toBe(2);
        expect(result.current.diaryNotes[0].NoteText).toBe('Future note');
    });

    it('loads LC notes directly when isLC is true', async () => {
        getPolicyNotesInfo.mockResolvedValueOnce(mockLCNotes);
        const { result } = renderHook(() =>
            useDiaryNotes({
                policyNumber: '123',
                clientCode: 'FLIC',
                offset: 0,
                limit: 10,
                showDiaryNotes: true,
                isLC: true,
            })
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.diaryNotes.length).toBe(2);
        expect(result.current.totalLogs).toBe(2);
        expect(result.current.diaryNotes[0].NoteText).toBe('Future note');
    });

    it('handles missing policyNumber/clientCode gracefully', async () => {
        const errorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});
        const { result } = renderHook(() =>
            useDiaryNotes({
                policyNumber: '',
                clientCode: '',
                offset: 0,
                limit: 10,
                showDiaryNotes: true,
                isLC: true,
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
                clientCode: 'FLIC',
                offset: 0,
                limit: 10,
                showDiaryNotes: false,
                isLC: false,
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
            ({ policyNumber, clientCode }) =>
                useDiaryNotes({
                    policyNumber: policyNumber,
                    clientCode: clientCode,
                    offset: 0,
                    limit: 10,
                    showDiaryNotes: true,
                    isLC: true,
                }),
            { initialProps: { policyNumber: '123', clientCode: 'FLIC' } }
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(getPolicyNotesInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                policyNumber: '123',
                clientCode: 'FLIC',
            })
        );
        rerender({ policyNumber: 'PN999', clientCode: 'FLIC' });
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(getPolicyNotesInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                policyNumber: 'PN999',
                clientCode: 'FLIC',
            })
        );
    });

    it('passes planCode and isLC correctly to getPolicyNotesInfo', async () => {
        getPolicyNotesInfo.mockResolvedValueOnce(mockFASTNotes);
        const { result } = renderHook(() =>
            useDiaryNotes({
                policyNumber: '123',
                clientCode: 'FLIC',
                offset: 0,
                limit: 10,
                showDiaryNotes: true,
                planCode: 'PLANX',
                isLC: true,
            })
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(getPolicyNotesInfo).toHaveBeenCalledWith(
            expect.objectContaining({ planCode: 'PLANX', isLC: true })
        );
    });
});
