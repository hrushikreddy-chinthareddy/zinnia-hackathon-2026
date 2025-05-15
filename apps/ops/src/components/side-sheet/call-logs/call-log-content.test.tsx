import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TFunction } from 'i18next';

import * as callLogQueries from '@deps/queries/api/contracts'; // { getCaseCallLogs }

import { CallLogsContent } from './call-logs-content';

jest.mock('@deps/queries/api/contracts');
const mockedGetCallLogs = jest.mocked(callLogQueries.getCaseCallLogs);

const mockCallLog = {
    callEntryID: 12345689,
    callSummary: 'My name is Inigo Montoya, you killed my father, prepare to die',
    callType: 'Revenge Revenge',
    callerName: 'Inigo Montoya',
    callerType: 'Boss',
    clientCode: 'test',
    contract: 'alsoTest',
    createdByUser: 'Inigo Montoya',
    createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'test',
    sessionID: 'sessionId',
};

const mockResult = {
    firstPage: '',
    lastPage: '',
    limit: 10,
    offset: 0,
    totalCount: 1,
    totalPages: 1,
    items: [mockCallLog],
};

describe('CallLogContent', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should render correct empty screen when there are no call logs', async () => {
        mockedGetCallLogs.mockReturnValueOnce(Promise.resolve({ data: null, status: 500 }));

        render(<CallLogsContent contractNumber="123" t={((key: any) => key) as TFunction} />);
        await waitFor(() => {
            expect(screen.getByTestId('call-logs-empty-icon')).toBeInTheDocument();
            expect(screen.getByText('sideSheet.callLogsEmptyTitle')).toBeInTheDocument();
            expect(screen.getByText('sideSheet.callLogsEmptyText')).toBeInTheDocument();
        });
    });

    it('should render correctly when there is one call log available', async () => {
        mockedGetCallLogs.mockReturnValueOnce(Promise.resolve({ data: mockResult, status: 200 }));

        render(<CallLogsContent contractNumber="123" t={((key: any) => key) as TFunction} />);
        await waitFor(() => {
            expect(screen.getAllByText('Inigo Montoya,')).toHaveLength(1);
            expect(screen.getAllByText('Boss')).toHaveLength(1);
            expect(screen.getAllByText(`Revenge revenge`)).toHaveLength(1);
            expect(screen.getAllByText(mockCallLog.callSummary)).toHaveLength(1);
            expect(screen.getAllByTestId('page-number')).toHaveLength(2);
        });
    });

    it('renders pagination bar correctly based on totalCount returned from query', async () => {
        mockedGetCallLogs.mockReturnValueOnce(Promise.resolve({ data: { ...mockResult, totalCount: 23 }, status: 200 }));

        render(<CallLogsContent contractNumber="123" t={((key: any) => key) as TFunction} />);
        await waitFor(() => {
            expect(screen.getAllByTestId('page-number')).toHaveLength(6);
        });
    });

    it('queries correctly when pagination buttons are clicked', async () => {
        mockedGetCallLogs.mockReturnValueOnce(Promise.resolve({ data: { ...mockResult, totalCount: 23 }, status: 200 }));

        render(<CallLogsContent contractNumber="123" t={((key: any) => key) as TFunction} />);
        await waitFor(() => {
            expect(screen.getAllByTestId('page-number')).toHaveLength(6);
        });

        const thirdPageBtn = screen.getAllByText('3')[0];

        await userEvent.click(thirdPageBtn);
        expect(mockedGetCallLogs).toHaveBeenCalledTimes(2);
        expect(mockedGetCallLogs).toHaveBeenLastCalledWith(expect.objectContaining({ contract: '123', limit: 10, offset: 20 }));
    });

    it('renders and removes sidesheet correctly based on user interaction', async () => {
        mockedGetCallLogs.mockReturnValueOnce(Promise.resolve({ data: mockResult, status: 200 }));

        render(<CallLogsContent contractNumber="123" t={((key: any) => key) as TFunction} />);

        // check for chevon and click chevon
        await waitFor(() => {
            const chevron = screen.getByTestId('chevron');
            expect(chevron).toBeInTheDocument();
            expect(screen.queryByText('sideSheet.callID')).toBeFalsy();
            expect(screen.queryByText(mockCallLog.callEntryID)).toBeFalsy();
            userEvent.click(chevron);
        });

        // check for Call ID field shown on secondary sidesheet, click on `back` text
        await waitFor(() => {
            expect(screen.getByText('sideSheet.backToCallList')).toBeInTheDocument();
            expect(screen.getByText('sideSheet.callID')).toBeInTheDocument();
            expect(screen.getByText(mockCallLog.callEntryID)).toBeInTheDocument();
            userEvent.click(screen.getByText('sideSheet.backToCallList'));
        });

        // check returning to primarily call log sidesheet
        await waitFor(() => {
            const chevron = screen.getByTestId('chevron');
            expect(chevron).toBeInTheDocument();
            expect(screen.queryByText('sideSheet.callID')).toBeFalsy();
            expect(screen.queryByText(mockCallLog.callEntryID)).toBeFalsy();
            userEvent.click(chevron);
        });
    });
});
