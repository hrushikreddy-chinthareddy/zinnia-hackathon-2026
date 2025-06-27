import '@testing-library/jest-dom';
import { Client } from '@optimizely/optimizely-sdk';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WorkflowProvider } from '@deps/contexts/WorkflowContainerContext';
import { ALLOWED_TAX_YEARS } from '@deps/models/case/send-tax-forms';
import * as TaxForm from '@deps/queries/api/tax-forms';

import TaxFormsSelection from './tax-forms-selection';
import { MultiselectOption } from '../autocomplete/autocomplete.types';
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

jest.mock('@optimizely/optimizely-sdk', () => ({
    createInstance: jest.fn(),
    OptimizelyDecideOption: {
        ENABLED_FLAGS_ONLY: 'ENABLED_FLAGS_ONLY',
        IGNORE_USER_PROFILE_SERVICE: 'IGNORE_USER_PROFILE_SERVICE',
    },
}));

jest.mock('@deps/queries/api/tax-forms');
const mockedSearchTaxForms = jest.mocked(TaxForm.searchTaxForms);

afterEach(() => {
    jest.clearAllMocks();
});

describe('TaxFormsSelection component', () => {
    let mockClient: jest.Mocked<Client>;

    beforeEach(() => {
        mockClient = {
            onReady: jest.fn().mockResolvedValue({ success: true }),
            createUserContext: jest.fn().mockReturnValue({
                decideAll: jest.fn().mockReturnValue({
                    flag1: { enabled: true },
                    flag2: { enabled: false },
                }),
            }),
        } as unknown as jest.Mocked<Client>;
    });

    const currentYear = new Date().getFullYear();
    const mockTaxYears = Array.from(
        { length: 5 },
        (_, i) => currentYear - i
    ).reverse();

    const mockTaxFormSelectionDetails = {
        selectedTaxForms: [],
        taxForms: [],
    };

    const taxYears = Array.from(
        { length: ALLOWED_TAX_YEARS },
        (_, i) => currentYear - i
    ).reverse();

    const taxYearOptions: MultiselectOption[] = taxYears.map((year) => ({
        label: year.toString(),
        value: year.toString(),
        displayText: year.toString(),
    }));

    const mockSetSelectedYears = jest.fn();
    const mockSetTaxFormSelectionDetails = jest.fn();
    it('renders the form selection component', () => {
        const { getByText } = render(
            <WorkflowProvider>
                <TaxFormsSelection
                    policy={{}}
                    taxFormSelectionDetails={mockTaxFormSelectionDetails}
                    setTaxFormSelectionDetails={mockSetTaxFormSelectionDetails}
                    taxYearOptions={taxYearOptions}
                    selectedYears={{}}
                    setSelectedYears={mockSetSelectedYears}
                />
            </WorkflowProvider>
        );
        expect(
            getByText('sendTaxForms.tabs.taxFormsSelection')
        ).toBeInTheDocument();
    });

    it('Should render tax year options', async () => {
        const mockTaxFormSelectionDetails = {
            selectedTaxForms: [],
            taxForms: [],
        };
        const mockSetSelectedYears = jest.fn();
        const { getByText, getByLabelText } = render(
            <WorkflowProvider>
                <TaxFormsSelection
                    policy={{}}
                    taxFormSelectionDetails={mockTaxFormSelectionDetails}
                    setTaxFormSelectionDetails={mockSetTaxFormSelectionDetails}
                    taxYearOptions={taxYearOptions}
                    selectedYears={{}}
                    setSelectedYears={mockSetSelectedYears}
                />
            </WorkflowProvider>
        );

        const checkboxOption = getByLabelText('sendTaxForms.selectTaxYear');
        await userEvent.click(checkboxOption);
        await waitFor(() =>
            mockTaxYears.map((year) =>
                expect(getByText(year.toString())).toBeInTheDocument()
            )
        );
    });

    it('should display a warning message when API returns an empty array response', async () => {
        mockedSearchTaxForms.mockResolvedValue(
            Promise.resolve({ data: { count: 0, items: [] }, error: null })
        );

        let setMethodArgs;
        const mockSetTaxFormSelectionDetails = jest.fn((cb) => {
            setMethodArgs = cb(mockTaxFormSelectionDetails);
            return setMethodArgs;
        });

        const mockSetSelectedYears = jest.fn();

        const { getByText, findByText, getByLabelText } = render(
            <WorkflowProvider>
                <TaxFormsSelection
                    policy={{}}
                    taxFormSelectionDetails={mockTaxFormSelectionDetails}
                    setTaxFormSelectionDetails={mockSetTaxFormSelectionDetails}
                    taxYearOptions={taxYearOptions}
                    selectedYears={{}}
                    setSelectedYears={mockSetSelectedYears}
                />
            </WorkflowProvider>
        );

        const checkboxOption = getByLabelText('sendTaxForms.selectTaxYear');
        await userEvent.click(checkboxOption);

        const lastYearOption = await findByText(currentYear.toString(), {
            ignore: 'option',
        });

        expect(lastYearOption).toBeInTheDocument();

        await userEvent.click(lastYearOption);

        expect(mockSetSelectedYears).toHaveBeenCalledWith({
            [currentYear.toString()]: currentYear.toString(),
        });

        expect(
            getByText('sendTaxForms.tabs.taxFormsSelection')
        ).toBeInTheDocument();
    });

    it('should display a tax forms list', async () => {
        const mockTaxFormSelectionDetails = {
            selectedTaxForms: [],
            taxForms: [],
        };

        jest.clearAllMocks();

        mockedSearchTaxForms.mockResolvedValue(
            Promise.resolve({
                data: {
                    count: 1,
                    items: [
                        {
                            contractNumber: '7003304118',
                            name: '5498',
                            fChar: '5',
                            formId: '5646',
                            taxYear: '2022',
                        },
                    ],
                },
                error: null,
            })
        );

        let setMethodArgs;
        const mockSetTaxFormSelectionDetails = jest.fn((cb) => {
            setMethodArgs = cb(mockTaxFormSelectionDetails);
            return setMethodArgs;
        });

        const mockSetSelectedYears = jest.fn();

        const { findByText, getByLabelText } = render(
            <WorkflowProvider>
                <TaxFormsSelection
                    policy={{}}
                    taxFormSelectionDetails={mockTaxFormSelectionDetails}
                    setTaxFormSelectionDetails={mockSetTaxFormSelectionDetails}
                    taxYearOptions={taxYearOptions}
                    selectedYears={{}}
                    setSelectedYears={mockSetSelectedYears}
                />
            </WorkflowProvider>
        );

        const checkboxOption = getByLabelText('sendTaxForms.selectTaxYear');
        await userEvent.click(checkboxOption);

        const lastYearOption = await findByText(currentYear.toString(), {
            ignore: 'option',
        });

        expect(lastYearOption).toBeInTheDocument();

        userEvent.click(lastYearOption);

        await waitFor(() =>
            expect(mockSetTaxFormSelectionDetails).toHaveReturnedWith({
                selectedTaxForms: [],
                taxForms: [
                    {
                        contractNumber: '7003304118',
                        name: '5498',
                        fChar: '5',
                        formId: '5646',
                        taxYear: '2022',
                    },
                ],
            })
        );
    });
});
