import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { FormDataContext, defaultFormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { AmountType, ProcessRequestType } from '@deps/models/case/withdrawal/case';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import AsOfDateComponent from './as-of-date';

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

describe('AsOfDate component', () => {
    describe('FLIC Form', () => {
        it('should not render as of date field', () => {
            const setMockData = jest.fn();
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formProgram: CaseDetails.data.formRequest.formProgram,
                        setFormProgram: setMockData,
                    }}
                >
                    <AsOfDateComponent />
                </FormDataContext.Provider>
            );
            const asofDateElement = screen.queryByTestId('field-input-test-id');
            expect(asofDateElement).not.toBeInTheDocument();
        });

        it('should render as of date when as of date option seleced', () => {
            const setMockData = jest.fn();

            const mockAsOfDateData = {
                ...CaseDetails.data.formRequest.formProgram,
                processRequestType: [{ text: ProcessRequestType.AsOfDate }],
            };
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formProgram: mockAsOfDateData,
                        setFormProgram: setMockData,
                    }}
                >
                    <AsOfDateComponent />
                </FormDataContext.Provider>
            );

            const asOfDateElemenent = screen.getByTestId('field-container-test-id');

            const dateInput = asOfDateElemenent.querySelector('[inputmode="numeric"]');
            if (dateInput !== null) {
                fireEvent.change(dateInput, { target: { value: '03072014' } });
            }
            expect(dateInput).toBeInTheDocument();
        });

        it('should map the payload correctly when user selects date', async () => {
            const mockAsOfDateData = {
                clientCode: 'FLIC',
                contractNumber: '884001432',
                withdrawType: {
                    text: 'NET',
                },
                amountQualifierType: null,
                program: {
                    text: 'Withdrawal',
                },
                programType: {
                    text: 'NetWithdrawal',
                },
                programSubType: {
                    text: null,
                },
                programFrequency: null,
                rollover: null,
                rmd: null,
                terminateprograms: null,
                programAmount: { text: null, amountType: AmountType.Dollar },
                partialAmount: {
                    text: '',
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
                processRequestType: [
                    {
                        text: 'AS_OF_DATE' as ProcessRequestType,
                    },
                ],
                programSubTypeOptions: null,
                isValidAsOfDate: true,
                asOfDate: {
                    text: null,
                },
            };

            let setMethodArgs;
            const setMockData = jest.fn(cb => {
                setMethodArgs = cb(mockAsOfDateData);
                return setMethodArgs;
            });

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formProgram: mockAsOfDateData,
                        setFormProgram: setMockData,
                    }}
                >
                    <AsOfDateComponent />
                </FormDataContext.Provider>
            );

            const dateElement = screen.getByTestId('field-container-test-id');

            const dateInput = dateElement.querySelector('[inputmode="numeric"]');
            if (dateInput !== null) {
                fireEvent.change(dateInput, { target: { value: '11242023' } });
            }
            expect(dateElement).toBeInTheDocument();

            expect(setMockData).toHaveBeenCalled();

            expect(setMockData).toHaveReturnedWith({
                ...mockAsOfDateData,
                asOfDate: {
                    text: '2023-11-24',
                },
            });
        });
    });
});
