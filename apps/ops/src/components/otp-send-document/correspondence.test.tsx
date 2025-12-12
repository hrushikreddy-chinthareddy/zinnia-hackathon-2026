import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useSendDocument } from '@deps/contexts/SendDocumentContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import {
    CommunicationTypes,
    SendDocumentAction,
} from '@deps/models/case/send-document';
import {
    AddressType,
    Country,
    State,
    PartyRole,
    Policy,
    PartyType,
} from '@zinnia/api-types/types/sor';

import Correspondence from './correspondence';

jest.mock('@deps/utils/server-logging');
jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: jest.fn((key: string, options?: Record<string, string>) => {
            if (options) return `${key} ${Object.values(options).join(' ')}`;
            return key;
        }),
    }),
}));

jest.mock('@deps/contexts/SendDocumentContext', () => ({
    useSendDocument: jest.fn(),
}));

jest.mock('@deps/contexts/WorkflowContainerContext', () => ({
    useWorkflow: jest.fn(),
}));

describe.skip('Correspondence component', () => {
    const mockPolicy: Policy = {
        parties: [
            {
                partyType: PartyType.INDIVIDUAL,
                partyId: '123',
                emails: [
                    {
                        emailAddress: 'test@zinnia.com',
                    },
                ],
                addresses: [
                    {
                        startDate: '1977-01-01',
                        endDate: '2999-12-31',
                        addressType: AddressType.RESIDENCE,
                        addressLine1: 'ONE SECURITY BENEFIT PLACE',
                        addressLine2: '',
                        addressLine3: '',
                        city: 'TOPEKA',
                        state: State.KS,
                        zipCode: '66636',
                        zipCodeExtension: '',
                        country: 'USA' as Country,
                        addressId: '6570354',
                    },
                    {
                        startDate: '1977-01-01',
                        endDate: '2999-12-31',
                        addressType: AddressType.BUSINESS,
                        addressLine1: '123 1ST ST',
                        addressLine2: 'STE 1',
                        addressLine3: '',
                        city: 'BELLEMEAD',
                        state: State.NJ,
                        zipCode: '66636',
                        zipCodeExtension: '',
                        country: 'USA' as Country,
                        addressId: '6570354',
                    },
                    {
                        startDate: '1977-01-01',
                        endDate: '2999-12-31',
                        addressType: AddressType.POBOX,
                        addressLine1: '1063 MIBTHCYKPO LN',
                        addressLine2: '',
                        addressLine3: '',
                        city: 'ORLANDO',
                        state: State.FL,
                        zipCode: '66636',
                        zipCodeExtension: '',
                        country: 'USA' as Country,
                        addressId: '6570354',
                    },
                ],
            },
        ],
        partyRoles: [
            {
                partyRole: 'E-DELIVERY' as PartyRole,
                partyId: '123',
            },
        ],
    };

    const handleSubmitRequest = jest.fn();

    const mockDispatch = jest.fn();
    const mockSetCurrentStepIndex = jest.fn();
    const mockGoToNext = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the component', () => {
        (useSendDocument as jest.Mock).mockReturnValue({
            state: {
                document: {
                    selected: {
                        formId: '1',
                    },
                },
            },
            dispatch: mockDispatch,
        });

        (useWorkflow as jest.Mock).mockReturnValue({
            setCurrentStepIndex: mockSetCurrentStepIndex,
            goToNext: mockGoToNext,
        });

        render(
            <Correspondence
                policy={mockPolicy}
                submitRequest={handleSubmitRequest}
            />
        );

        expect(
            screen.getByText('allFields.correspondence')
        ).toBeInTheDocument();
        expect(screen.getByText('allFields.fax')).toBeInTheDocument();
    });

    it('should pre-populate the email for E-delivery role', async () => {
        (useSendDocument as jest.Mock).mockReturnValue({
            state: {
                document: {
                    selected: {
                        formId: '1',
                    },
                },
                correspondence: {
                    type: CommunicationTypes.Email,
                    recipient:
                        mockPolicy?.parties?.[0]?.emails?.[0]?.emailAddress ||
                        '',
                },
            },
            dispatch: mockDispatch,
        });

        (useWorkflow as jest.Mock).mockReturnValue({
            setCurrentStepIndex: mockSetCurrentStepIndex,
            goToNext: mockGoToNext,
        });

        render(
            <Correspondence
                policy={mockPolicy}
                submitRequest={handleSubmitRequest}
            />
        );

        const emailRadio = screen.getAllByLabelText(
            'allFields.email'
        )[0] as HTMLInputElement;
        expect(emailRadio).toBeInTheDocument();
        fireEvent.keyDown(emailRadio, { key: 'Enter', keyCode: 13 });
        await waitFor(() => {
            expect(emailRadio).toBeChecked();
        });

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith({
                type: SendDocumentAction.Correspondence,
                payload: {
                    type: CommunicationTypes.Email,
                    recipient:
                        mockPolicy?.parties?.[0]?.emails?.[0]?.emailAddress ||
                        '',
                },
            });
        });
    });

    it('should be able to update the state for fax on input', async () => {
        (useSendDocument as jest.Mock).mockReturnValue({
            state: {
                document: {
                    selected: {
                        formId: '1',
                    },
                },
            },
            dispatch: mockDispatch,
        });

        (useWorkflow as jest.Mock).mockReturnValue({
            setCurrentStepIndex: mockSetCurrentStepIndex,
            goToNext: mockGoToNext,
        });

        render(
            <Correspondence
                policy={mockPolicy}
                submitRequest={handleSubmitRequest}
            />
        );

        const faxRadio = screen.getByLabelText('allFields.fax');
        expect(faxRadio).toBeInTheDocument();
        fireEvent.keyDown(faxRadio, { key: 'Enter', keyCode: 13 });
        await waitFor(() => {
            expect(faxRadio).toBeChecked();
        });

        const faxInput = screen.getByLabelText('fax') as HTMLInputElement;
        fireEvent.change(faxInput, { target: { value: '123456789' } });

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith({
                type: SendDocumentAction.Correspondence,
                payload: {
                    type: CommunicationTypes.Fax,
                    recipient: '123456789',
                },
            });
        });
    });

    it('should display validation for corelation id', async () => {
        (useSendDocument as jest.Mock).mockReturnValue({
            state: {
                document: {
                    selected: {
                        formId: '1',
                    },
                },
                correspondence: {
                    type: CommunicationTypes.Email,
                    recipient:
                        mockPolicy?.parties?.[0]?.emails?.[0]?.emailAddress ||
                        '',
                },
            },
            dispatch: mockDispatch,
        });

        (useWorkflow as jest.Mock).mockReturnValue({
            setCurrentStepIndex: mockSetCurrentStepIndex,
            goToNext: mockGoToNext,
        });

        render(
            <Correspondence
                policy={mockPolicy}
                submitRequest={handleSubmitRequest}
            />
        );

        //click on continue
        await userEvent.click(screen.getByText('continue'));

        expect(
            screen.getByText('No correlationId provided')
        ).toBeInTheDocument();
    });

    it('should select email type default', async () => {
        (useSendDocument as jest.Mock).mockReturnValue({
            state: {
                document: {
                    selected: {
                        formId: '1',
                    },
                },
            },
            dispatch: mockDispatch,
        });

        (useWorkflow as jest.Mock).mockReturnValue({
            setCurrentStepIndex: mockSetCurrentStepIndex,
            goToNext: mockGoToNext,
        });

        render(
            <Correspondence
                policy={mockPolicy}
                submitRequest={handleSubmitRequest}
            />
        );

        expect(screen.getByTestId('allFields.email')).toBeInTheDocument();
    });

    it.skip('should display addresses on Mail type selection', async () => {
        (useSendDocument as jest.Mock).mockReturnValue({
            state: {
                document: {
                    selected: {
                        formId: '1',
                    },
                },
                correspondence: {
                    type: CommunicationTypes.Email,
                    recipient: '',
                },
            },
            dispatch: mockDispatch,
        });

        (useWorkflow as jest.Mock).mockReturnValue({
            setCurrentStepIndex: mockSetCurrentStepIndex,
            goToNext: mockGoToNext,
        });

        render(
            <Correspondence
                policy={mockPolicy}
                submitRequest={handleSubmitRequest}
            />
        );

        //click on continue

        const mailOption = screen.getByTestId(
            'allFields.mail '
        ) as HTMLInputElement;
        fireEvent.click(mailOption);

        // check radio email selected
        await expect(mailOption.checked).toBe(true);

        //expect to address cards to loaded
        expect(screen.getAllByRole('address-card')).toBeInTheDocument();
    });
});
