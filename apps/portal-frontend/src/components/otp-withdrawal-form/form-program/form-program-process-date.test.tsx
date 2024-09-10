import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { FormDataContext, defaultFormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { AmountType, CaseStatus, ProcessRequestType } from '@deps/models/case/withdrawal/case';

import AsOfDateComponent from './as-of-date';
import FormProgramProcessDate, { SelectOneOption } from './form-program-process-date';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

jest.mock('next/navigation', () => {
    return {
        __esModule: true,
        useSearchParams: () => ({
            get: () => {},
        }),
    };
});

afterEach(() => {
    jest.clearAllMocks();
});
describe('Process Request Type component', () => {
    describe('Full Withdrawal Type', () => {
        const fullFormProgram = {
            clientCode: 'FLIC',
            contractNumber: '7370003234',
            withdrawType: {
                text: 'GROSS',
            },
            amountQualifierType: null,
            program: {
                text: 'Withdrawal',
            },
            programType: {
                text: 'Full Surrender',
            },
            programSubType: {
                text: null,
            },
            programFrequency: null,
            rollover: null,
            rmd: null,
            programAmount: { text: null, amountType: AmountType.Dollar },
            partialAmount: {
                text: null,
                amountType: 'DOLLAR' as AmountType,
            },
            partialPercent: {
                text: null,
                amountType: 'PERCENT' as AmountType,
            },
            partialGrossAmount: {
                text: null,
                amountType: 'DOLLAR' as AmountType,
            },
            partialNetAmount: {
                text: null,
                amountType: 'DOLLAR' as AmountType,
            },
            gmwbAmount: {
                text: null,
                amountType: 'DOLLAR' as AmountType,
            },
            processRequestType: null,
            programSubTypeOptions: null,
            accountCloseReason: {
                text: 'CONTRACT_ATTACH,SURRENDER,CONTRACT_LOST',
            },
            asOfDate: {
                text: null,
            },
            isValidAsOfDate: true,
        };

        const selectOneOptions: SelectOneOption[] = [
            { label: 'immediately', value: ProcessRequestType.Immediately },
            {
                label: 'whenTheContractIsNoLongerSubjectToWithdrawalCharges',
                value: ProcessRequestType.NoLongerSubject,
            },
            { label: 'asOfThisDate', value: ProcessRequestType.AsOfDate, subElement: <AsOfDateComponent /> },
        ];

        it('should render process request options ', async () => {
            render(
                <FormDataContext.Provider
                    value={{ ...defaultFormDataContext, formProgram: fullFormProgram, currentFormState: CaseStatus.Pending }}
                >
                    <FormProgramProcessDate options={selectOneOptions} />
                </FormDataContext.Provider>
            );

            await waitFor(() => {
                const immediatelyElement = screen.getByLabelText('immediately');
                expect(immediatelyElement).toBeInTheDocument();

                const whenTheContractIsNoLongerSubjectToWithdrawalChargesElement = screen.getByLabelText(
                    'whenTheContractIsNoLongerSubjectToWithdrawalCharges'
                );
                expect(whenTheContractIsNoLongerSubjectToWithdrawalChargesElement).toBeInTheDocument();

                const asOfThisDateElement = screen.getByLabelText('asOfThisDate');
                expect(asOfThisDateElement).toBeInTheDocument();
            });
        });

        it('should render the date when asOfThisDate selected', async () => {
            render(
                <FormDataContext.Provider
                    value={{ ...defaultFormDataContext, currentFormState: CaseStatus.Pending, formProgram: fullFormProgram }}
                >
                    <FormProgramProcessDate options={selectOneOptions} />
                </FormDataContext.Provider>
            );

            const asOfThisDateElement = screen.getByLabelText('asOfThisDate');
            expect(asOfThisDateElement).toBeInTheDocument();
            fireEvent.keyDown(asOfThisDateElement, { key: 'Enter', keyCode: 13 });
            await waitFor(() => {
                expect(asOfThisDateElement).toBeChecked();
            });

            const dateElement = screen.getByLabelText('asOfThisDate');
            expect(dateElement).toBeInTheDocument();
        });

        it('should map the payload correctly when user selects asOfThisDate', async () => {
            const mockFormProgram = jest.fn();
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formProgram: fullFormProgram,
                        currentFormState: CaseStatus.Pending,
                        setFormProgram: mockFormProgram,
                    }}
                >
                    <FormProgramProcessDate options={selectOneOptions} />
                </FormDataContext.Provider>
            );

            const asOfThisDateElement = screen.getByLabelText('asOfThisDate');
            expect(asOfThisDateElement).toBeInTheDocument();
            fireEvent.keyDown(asOfThisDateElement, { key: 'Enter', keyCode: 13 });
            await waitFor(() => {
                expect(asOfThisDateElement).toBeChecked();
            });

            expect(mockFormProgram).toHaveBeenCalledWith({
                ...fullFormProgram,
                processRequestType: [
                    {
                        text: 'AS_OF_DATE',
                    },
                ],
                isValidAsOfDate: true,
                asOfDate: {
                    text: null,
                },
            });
        });

        it('should map the payload correctly when user selects contractElement', async () => {
            const mockFormProgram = jest.fn();
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formProgram: fullFormProgram,
                        currentFormState: CaseStatus.Pending,
                        setFormProgram: mockFormProgram,
                    }}
                >
                    <FormProgramProcessDate options={selectOneOptions} />
                </FormDataContext.Provider>
            );

            const contractElement = screen.getByLabelText('whenTheContractIsNoLongerSubjectToWithdrawalCharges');
            expect(contractElement).toBeInTheDocument();
            fireEvent.keyDown(contractElement, { key: 'Enter', keyCode: 13 });
            await waitFor(() => {
                expect(contractElement).toBeChecked();
            });

            expect(mockFormProgram).toHaveBeenCalledWith({
                ...fullFormProgram,
                processRequestType: [
                    {
                        text: 'NOCDSC',
                    },
                ],
            });
        });

        it('should map the payload correctly when user selects immediately', async () => {
            const mockFormProgram = jest.fn();
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formProgram: fullFormProgram,
                        currentFormState: CaseStatus.Pending,
                        setFormProgram: mockFormProgram,
                    }}
                >
                    <FormProgramProcessDate options={selectOneOptions} />
                </FormDataContext.Provider>
            );

            const immediatelyElement = screen.getByLabelText('immediately');
            expect(immediatelyElement).toBeInTheDocument();
            fireEvent.keyDown(immediatelyElement, { key: 'Enter', keyCode: 13 });
            await waitFor(() => {
                expect(immediatelyElement).toBeChecked();
            });

            expect(mockFormProgram).toHaveBeenCalledWith({
                ...fullFormProgram,
                processRequestType: [
                    {
                        text: 'IMMED',
                    },
                ],
            });
        });
    });

    describe('Partial Withdrawal Type', () => {
        const partialFormProgram = {
            clientCode: 'FLIC',
            contractNumber: '7370003234',
            withdrawType: {
                text: '',
            },
            amountQualifierType: null,
            program: {
                text: 'Withdrawal',
            },
            programType: {
                text: '',
            },
            programSubType: {
                text: '',
            },
            programFrequency: null,
            rollover: null,
            rmd: null,
            programAmount: { text: null, amountType: AmountType.Dollar },
            partialAmount: {
                text: null,
                amountType: 'DOLLAR' as AmountType,
            },
            partialPercent: {
                text: null,
                amountType: 'PERCENT' as AmountType,
            },
            partialGrossAmount: {
                text: null,
                amountType: 'DOLLAR' as AmountType,
            },
            partialNetAmount: {
                text: null,
                amountType: 'DOLLAR' as AmountType,
            },
            gmwbAmount: {
                text: null,
                amountType: 'DOLLAR' as AmountType,
            },
            processRequestType: null,
            programSubTypeOptions: null,
            asOfDate: {
                text: null,
            },
            isValidAsOfDate: true,
        };

        const selectOneOptions: SelectOneOption[] = [
            { label: 'immediately', value: ProcessRequestType.Immediately },
            {
                label: 'whenTheContractIsNoLongerSubjectToWithdrawalCharges',
                value: ProcessRequestType.NoLongerSubject,
            },
            { label: 'asOfThisDate', value: ProcessRequestType.AsOfDate, subElement: <AsOfDateComponent /> },
        ];

        it('should render process request options ', async () => {
            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext, formProgram: partialFormProgram }}>
                    <FormProgramProcessDate options={selectOneOptions} />
                </FormDataContext.Provider>
            );

            await waitFor(() => {
                const immediatelyElement = screen.getByLabelText('immediately');
                expect(immediatelyElement).toBeInTheDocument();

                const contractElement = screen.getByLabelText('whenTheContractIsNoLongerSubjectToWithdrawalCharges');
                expect(contractElement).toBeInTheDocument();

                const asOfThisDateElement = screen.getByLabelText('asOfThisDate');
                expect(asOfThisDateElement).toBeInTheDocument();
            });
        });
    });
});
