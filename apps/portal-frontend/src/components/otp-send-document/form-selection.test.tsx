import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { defaultSendDocumentState, SendDocumentContext } from '@deps/contexts/SendDocumentContext';
import { WorkflowProvider } from '@deps/contexts/WorkflowContainerContext';
import { SendDocumentAction } from '@deps/models/case/send-document';
import * as ChatBot from '@deps/queries/api/c2web';

import FormSelection from './form-selection';

window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.HTMLElement.prototype.hasPointerCapture = jest.fn();

jest.mock('@deps/utils/server-logging');
jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: jest.fn((key: string, options?: Record<string, string>) => {
            if (options) return `${key} ${Object.values(options).join(' ')}`;
            return key;
        }),
    }),
}));

jest.mock('@deps/queries/api/c2web');
const mockedTransactionSubTypesApi = jest.mocked(ChatBot.getTransactionSubTypes);

afterEach(() => {
    jest.clearAllMocks();
});

describe('Form selection component', () => {
    const mockDispatch = jest.fn();

    jest.mock('@deps/contexts/SendDocumentContext', () => ({
        useSendDocument: () => ({ state: {}, dispatch: mockDispatch }),
    }));

    const transactionTypes = [
        { label: 'transactionType1', value: '1' },
        { label: 'transactionType2', value: '2' },
    ];
    const selectedTransactionState = {
        selected: '1',
        list: transactionTypes,
    };

    const selectedTransactionSubTypeState = {
        selected: null,
        list: [
            { label: 'Subtype1', value: '1' },
            { label: 'Subtype2', value: '2' },
        ],
    };

    it('should fetch sub types on transaction type change', async () => {
        const setMockDispatch = jest.fn();
        const mockTransactionSubTypes = [
            { name: 'Subtype1', id: '1' },
            { name: 'Subtype2', id: '2' },
        ];

        mockedTransactionSubTypesApi.mockResolvedValue(Promise.resolve(mockTransactionSubTypes));

        render(
            <SendDocumentContext.Provider value={{ ...defaultSendDocumentState, dispatch: setMockDispatch }}>
                <WorkflowProvider>
                    <FormSelection transactionTypes={transactionTypes} policy={{}} ctiCallNumber="" />
                </WorkflowProvider>
            </SendDocumentContext.Provider>
        );

        const dropdown = await screen.getAllByRole('combobox')[0];
        await userEvent.click(dropdown);
        const option1 = await screen.findByRole('option', { name: 'transactionType1' });
        expect(option1).toBeInTheDocument();

        await userEvent.click(option1);

        expect(setMockDispatch).toBeCalled();
        expect(setMockDispatch).toHaveBeenCalledWith({
            type: SendDocumentAction.TransactionType,
            payload: {
                selected: '1',
                list: transactionTypes,
            },
        });
    });

    it('should fetch forms on transaction sub type selection', async () => {
        const mockedDocumentsApi = jest.mocked(ChatBot.searchForms);

        const setMockDispatch = jest.fn();

        const mockedForms = [
            {
                formId: 4,
                formNumber: '32-77942-06',
                formShortName: 'SBGC_RMD',
                formDisplayName: 'Required Minimum Distribution (RMD) for Annuity Contract',
            },
        ];

        mockedDocumentsApi.mockResolvedValue(Promise.resolve(mockedForms));

        render(
            <SendDocumentContext.Provider
                value={{
                    ...defaultSendDocumentState,
                    state: {
                        ...defaultSendDocumentState.state,
                        transactionType: selectedTransactionState,
                        transactionSubType: selectedTransactionSubTypeState,
                    },
                    dispatch: setMockDispatch,
                }}
            >
                <WorkflowProvider>
                    <FormSelection transactionTypes={transactionTypes} policy={{}} ctiCallNumber="" />
                </WorkflowProvider>
            </SendDocumentContext.Provider>
        );

        const transactionSubTypeDropdown = await screen.getAllByRole('combobox')[1];
        await userEvent.click(transactionSubTypeDropdown);
        const option1 = await screen.findByRole('option', { name: 'Subtype2' });
        expect(option1).toBeInTheDocument();

        await userEvent.click(option1);

        expect(setMockDispatch).toBeCalled();
        expect(setMockDispatch).toHaveBeenCalledWith({
            type: SendDocumentAction.Documents,
            payload: {
                selected: mockedForms[0],
                list: mockedForms,
            },
        });
    });

    it('should display form not found on [] response', async () => {
        render(
            <SendDocumentContext.Provider
                value={{
                    ...defaultSendDocumentState,
                    state: {
                        ...defaultSendDocumentState.state,
                        transactionType: selectedTransactionState,
                        transactionSubType: selectedTransactionSubTypeState,
                        document: { selected: null, list: [] },
                    },
                }}
            >
                <WorkflowProvider>
                    <FormSelection transactionTypes={transactionTypes} policy={{}} ctiCallNumber="" />
                </WorkflowProvider>
            </SendDocumentContext.Provider>
        );

        expect(screen.getByText('formSelection.noFormsFound')).toBeInTheDocument();
    });

    it('should display validation when form not selected', async () => {
        const mockedForms = [
            {
                formId: 4,
                formNumber: '32-77942-06',
                formShortName: 'SBGC_RMD',
                formDisplayName: 'Required Minimum Distribution (RMD) for Annuity Contract',
            },
        ];
        render(
            <SendDocumentContext.Provider
                value={{
                    ...defaultSendDocumentState,
                    state: {
                        ...defaultSendDocumentState.state,
                        transactionType: selectedTransactionState,
                        transactionSubType: selectedTransactionSubTypeState,
                        document: { selected: null, list: mockedForms },
                    },
                }}
            >
                <WorkflowProvider>
                    <FormSelection transactionTypes={transactionTypes} policy={{}} ctiCallNumber="" />
                </WorkflowProvider>
            </SendDocumentContext.Provider>
        );

        //show validation on continue click
        const button = screen.getByRole('button', { name: 'continue' });
        await userEvent.click(button);
        expect(screen.getByText('errors.formId')).toBeInTheDocument();
    });
});
