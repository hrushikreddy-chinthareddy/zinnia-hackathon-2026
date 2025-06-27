import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import {
    AccountCloseReason,
    AmountType,
    CaseStatus,
    ProcessRequestType,
} from '@deps/models/case/withdrawal/case';

import AsOfDateComponent from './as-of-date';
import FormProgramFullWithdrawal from './form-program-full-withdrawal';
import { SelectOneOption } from './form-program-process-date';

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

const t = jest.fn();
afterEach(() => {
    jest.clearAllMocks();
});

describe('Full Withdrawal component', () => {
    describe('FLIC Form', () => {
        const formProgram = {
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

        const fullWithdrawalOptions = [
            {
                label: t('withdrawTheEntireContractValue'),
                value: AccountCloseReason.Surrender,
            },
            {
                label: t('contractIsAttached'),
                value: AccountCloseReason.ContractAttached,
            },
            {
                label: t('contractHasBeenLostOrDestroyed'),
                value: AccountCloseReason.ContractLost,
            },
        ];

        const selectOneOptions: SelectOneOption[] = [
            {
                label: 'amountDetails.processTimeframe.immediately',
                value: ProcessRequestType.Immediately,
            },
            {
                label: 'amountDetails.processTimeframe.whenTheContractIsNoLongerSubjectToWithdrawalCharges',
                value: ProcessRequestType.NoLongerSubject,
            },
            {
                label: 'amountDetails.processTimeframe.asOfThisDate',
                value: ProcessRequestType.AsOfDate,
                subElement: <AsOfDateComponent />,
            },
        ];

        it('should render the title', () => {
            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                    <FormProgramFullWithdrawal
                        selectOneOptions={selectOneOptions}
                    />
                </FormDataContext.Provider>
            );

            const sectionTitle = screen.getByText('title');
            expect(sectionTitle).toBeInTheDocument();
            expect(sectionTitle.tagName).toBe('H3');
        });

        it('should render full withdrawal options ', async () => {
            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                    <FormProgramFullWithdrawal
                        selectOneOptions={selectOneOptions}
                        fullWithdrawalOptions={fullWithdrawalOptions}
                    />
                </FormDataContext.Provider>
            );

            await waitFor(() => {
                fullWithdrawalOptions.map((item) => {
                    const fullWithdrawalOptionElement = screen.getByTestId(
                        item.value
                    );
                    expect(fullWithdrawalOptionElement).toBeInTheDocument();
                });
            });
        });

        it('should pre-populate the payload selection', async () => {
            const setMockData = jest.fn();
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formProgram,
                        setFormProgram: setMockData,
                    }}
                >
                    <FormProgramFullWithdrawal
                        fullWithdrawalOptions={fullWithdrawalOptions}
                    />
                </FormDataContext.Provider>
            );

            await waitFor(() => {
                fullWithdrawalOptions.map((item) => {
                    const fullWithdrawalOptionElement = screen.getByTestId(
                        item.value
                    );
                    expect(fullWithdrawalOptionElement).toBeInTheDocument();
                    expect(fullWithdrawalOptionElement).toBeChecked();
                });
            });

            expect(setMockData).toHaveBeenCalledTimes(1);
        });

        it('should handle checkbox checked', async () => {
            const fullWithdrawal = {
                ...formProgram,
                accountCloseReason: {
                    text: '',
                },
            };

            const setMockData = jest.fn();
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formProgram: { ...fullWithdrawal },
                        setFormProgram: setMockData,
                    }}
                >
                    <FormProgramFullWithdrawal
                        selectOneOptions={selectOneOptions}
                        fullWithdrawalOptions={fullWithdrawalOptions}
                    />
                </FormDataContext.Provider>
            );

            await waitFor(() => {
                fullWithdrawalOptions.map((item) => {
                    const fullWithdrawalOptionElement = screen.getByTestId(
                        item.value
                    );
                    expect(fullWithdrawalOptionElement).toBeInTheDocument();
                    expect(fullWithdrawalOptionElement).not.toBeChecked();
                });
            });

            const surrenderElement = screen.getByTestId(
                AccountCloseReason.Surrender
            );
            userEvent.click(surrenderElement);

            await waitFor(() => {
                expect(surrenderElement).toBeChecked();
            });
        });
    });
});
