import '@testing-library/jest-dom';
import { fireEvent, render, screen, renderHook } from '@testing-library/react';
import { TFunctionDetailedResult } from 'i18next';
import { TFunction } from 'next-i18next';

import useMassSSWConfig from '@deps/containers/otp/ssw-forms/mass/mass-ssw-form-helpers';
import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import {
    AmountType,
    CaseStatus,
    SSWType,
    FundWithdrawnMethod,
} from '@deps/models/case/withdrawal/case';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import FormDistribution from './form-distribution';
jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

describe('Form Distribution component', () => {
    const t: TFunction = (key: string | string[]) =>
        key as unknown as TFunctionDetailedResult<string>;

    const {
        result: { current },
    } = renderHook(() => useMassSSWConfig(t));

    const fundWithdrawnMethodOptions = [
        {
            label: 'caseWithdrawal.request.distributionInstruction.prorata',
            value: FundWithdrawnMethod.Default,
        },
        {
            label: 'caseWithdrawal.request.distributionInstruction.specifyFunds',
            value: FundWithdrawnMethod.SpecifyFunds,
        },
    ];
    describe('FLIC Form', () => {
        it('should render the title', () => {
            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                    <FormDistribution
                        fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                        title="caseWithdrawal.request.distributionInstruction.investmentSelectionForDistribution"
                    />
                </FormDataContext.Provider>
            );
            const sectionTitle = screen.getByText(
                'caseWithdrawal.request.distributionInstruction.investmentSelectionForDistribution'
            );
            expect(sectionTitle).toBeInTheDocument();
            expect(sectionTitle.tagName).toBe('H3');
        });

        it('should render all the distribution options', () => {
            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                    <FormDistribution
                        fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                        title="caseWithdrawal.request.distributionInstruction.investmentSelectionForDistribution"
                    />
                </FormDataContext.Provider>
            );
            const prorataElement = screen.getByText(
                'caseWithdrawal.request.distributionInstruction.prorata'
            );
            expect(prorataElement).toBeInTheDocument();

            const wireOptionElement = screen.getByText(
                'caseWithdrawal.request.distributionInstruction.specifyFunds'
            );
            expect(wireOptionElement).toBeInTheDocument();
        });

        it('should trigger the specify funds selection on click', () => {
            const fundWithdrawnVal =
                CaseDetails.data.formRequest.formProgram.programSubType.text;
            const setMockData = jest.fn();
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        fundWithdrawnMethod: fundWithdrawnVal,
                        setFundWithdrawnMethod: setMockData,
                    }}
                >
                    <FormDistribution
                        fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                        title="caseWithdrawal.request.distributionInstruction.investmentSelectionForDistribution"
                    />
                </FormDataContext.Provider>
            );

            const specifyFundsElement = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionInstruction.specifyFunds'
            );

            expect(specifyFundsElement).toBeInTheDocument();

            fireEvent.click(specifyFundsElement);

            expect(setMockData).toHaveBeenCalledWith(
                FundWithdrawnMethod.SpecifyFunds
            );
        });

        // number field is not supoorting data-test-id
        it('should render all the inputs on specify funds selection', () => {
            const fundWithdrawnVal = FundWithdrawnMethod.SpecifyFunds;
            let setMethodArgs;
            const setMockData = jest.fn((cb) => {
                setMethodArgs = cb(
                    CaseDetails.data.formRequest.formDistribution
                );
                return setMethodArgs;
            });
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDistribution:
                            CaseDetails.data.formRequest.formDistribution,
                        fundWithdrawnMethod: fundWithdrawnVal,
                        setFormDistribution: setMockData,
                    }}
                >
                    <FormDistribution
                        fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                        title="caseWithdrawal.request.distributionInstruction.investmentSelectionForDistribution"
                    />
                </FormDataContext.Provider>
            );

            const specifyFundsTitle = screen.getByText('listOfFunds');
            expect(specifyFundsTitle).toBeInTheDocument();

            const dollarAmountInputs = screen.getAllByTestId(/^dollarAmount-/);
            expect(dollarAmountInputs).toHaveLength(3);

            const percentageAmountInputs =
                screen.getAllByTestId(/^percentAmount-/);
            expect(percentageAmountInputs).toHaveLength(3);

            const dollarAmountElement = screen.getByTestId(
                'dollarAmount-0'
            ) as HTMLInputElement;
            fireEvent.change(dollarAmountElement, { target: { value: '200' } });
            expect(dollarAmountElement.value).toBe('200');

            const percentageAmountElement = screen.getByTestId(
                'percentAmount-1'
            ) as HTMLInputElement;
            fireEvent.change(percentageAmountElement, {
                target: { value: '50' },
            });
            expect(percentageAmountElement.value).toBe('50');

            expect(setMockData).toHaveBeenCalled();
            expect(setMethodArgs).toEqual({
                ...CaseDetails.data.formRequest.formDistribution,
                funds: [
                    {
                        amount: {
                            text: '200',
                            amountType: AmountType.Dollar,
                        },
                        fundCode: '056HJ0A',
                        fundName: 'Fixed',
                    },
                    {
                        amount: {
                            text: '50',
                            amountType: AmountType.Percent,
                        },
                        fundCode: '056HJ0B',
                        fundName: 'This is a somewhat long fund name',
                    },
                    {
                        amount: {
                            text: '25000',
                            amountType: AmountType.Dollar,
                        },
                        fundCode: '056HJ0C',
                        fundName:
                            'This is an even longer fund name, just to see what happens',
                    },
                ],
            });
        });

        it('should disable Prorata option when SSW Type Percent of A.V is selected', () => {
            const fundWithdrawnVal =
                CaseDetails.data.formRequest.formProgram.programSubType.text;

            const setMockData = jest.fn();
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formProgram: {
                            ...defaultFormDataContext.formProgram,
                            programSubType: {
                                text: SSWType.PercentOfAmountValue,
                            },
                        },
                        fundWithdrawnMethod: fundWithdrawnVal,
                        setFundWithdrawnMethod: setMockData,
                    }}
                >
                    <FormDistribution
                        fundWithdrawnMethodOptions={current.fundWithdrawnMethodOptions(
                            SSWType.PercentOfAmountValue
                        )}
                        title="caseWithdrawal.request.distributionInstruction.investmentSelectionForDistribution"
                    />
                </FormDataContext.Provider>
            );

            const prorataElement = screen.getByTestId(
                'button-group-label-test-id-distributionInstruction.prorata'
            );

            expect(prorataElement).toHaveClass('cursor-not-allowed');
        });
    });
});
