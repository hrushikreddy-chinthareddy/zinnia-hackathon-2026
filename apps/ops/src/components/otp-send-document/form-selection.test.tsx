import '@testing-library/jest-dom';
import { fireEvent, render, waitFor } from '@testing-library/react';

import { defaultSendDocumentState, SendDocumentContext } from '@deps/contexts/SendDocumentContext';
import { WorkflowProvider } from '@deps/contexts/WorkflowContainerContext';
import { SendDocumentFormParts } from '@deps/models/case/send-document';

import FormSelection from './form-selection';
import { PermissionsProvider } from '@deps/contexts/PermissionsContext';
import { UserProvider } from '@auth0/nextjs-auth0/client';

window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.HTMLElement.prototype.hasPointerCapture = jest.fn();

window.analytics = {
    track: jest.fn(),
}

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

afterEach(() => {
    jest.clearAllMocks();
});

describe('Form selection component', () => {
    const mockDispatch = jest.fn();
    const mockAvailableFormsTransactions = [
        {
            id: 'AUTHORIZATION',
            name: 'Authorization',
            transactionSubType: [
                {
                    id: 'ELECTRONIC_PHONE_AUTHORIZATION',
                    name: 'Electronic Phone Authorization',
                },
                {
                    id: 'GLWB_RENEWAL',
                    name: 'GLWB Renewal',
                },
            ],
        },
        {
            id: 'DEATH_CLAIM',
            name: 'Death Claim',
            transactionSubType: [
                {
                    id: 'CLAIM_PROOF_OF_DEATH',
                    name: 'Claim/Proof of Death',
                },
            ],
        },
    ];
    jest.mock('@deps/contexts/SendDocumentContext', () => ({
        useSendDocument: () => ({ state: {}, dispatch: mockDispatch }),
    }));

    const setMockDispatch = jest.fn();

    it('renders an error message when no form is selected', async () => {
        const { getByText } = render(
            <UserProvider>
                <PermissionsProvider>
                    <SendDocumentContext.Provider value={{ ...defaultSendDocumentState, dispatch: setMockDispatch }}>
                        <WorkflowProvider>
                            <FormSelection
                                availableFormsTransactions={mockAvailableFormsTransactions}
                                policy={{}}
                                ctiCallNumber=""
                                formDetails={[] as SendDocumentFormParts[]}
                                setFormDetails={() => []}
                            />
                        </WorkflowProvider>
                    </SendDocumentContext.Provider>
                </PermissionsProvider>
            </UserProvider>
        );
        const continueButton = getByText('continue');
        fireEvent.click(continueButton);
        await waitFor(() => expect(getByText('errors.formId')).toBeInTheDocument());
    });

    it('renders the component', () => {
        const { getByText } = render(
            <SendDocumentContext.Provider value={{ ...defaultSendDocumentState, dispatch: setMockDispatch }}>
                <WorkflowProvider>
                    <FormSelection
                        availableFormsTransactions={mockAvailableFormsTransactions}
                        policy={{}}
                        ctiCallNumber=""
                        formDetails={[] as SendDocumentFormParts[]}
                        setFormDetails={() => []}
                    />
                </WorkflowProvider>
            </SendDocumentContext.Provider>
        );
        expect(getByText('tabs.formSelection')).toBeInTheDocument();
    });
});
