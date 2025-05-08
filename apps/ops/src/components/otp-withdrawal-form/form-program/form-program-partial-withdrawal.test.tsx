import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WithdrawalSelectionValues } from '@deps/containers/otp/withdrawal-forms/flic-withdrawal-form.helpers';
import { FormDataContext, defaultFormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { AmountType, CaseStatus } from '@deps/models/case/withdrawal/case';

import FormProgramPartialWithdrawal, { PartialWithdrawalOption } from './form-program-partial-withdrawal';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

afterEach(() => {
    jest.clearAllMocks();
});

// TODO MG: unskip this
describe.skip('Partial Withdrawal component', () => {
    // added below code t fix the dropdown target.hasPointerCapture is not a function issue
    window.HTMLElement.prototype.hasPointerCapture = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    describe('FLIC Form', () => {
        const generatePayloadTotalFreeWithdrawal = jest.fn();
        const generatePayloadnetWithdrawal = jest.fn();
        const generatePayloadgrossWithdrawal = jest.fn();

        const identifySelectedFormProgramOption = jest.fn(() => {
            return { selectedOption: null, amount: '' };
        });

        const partialWithdrawalOptions: PartialWithdrawalOption[] = [
            {
                label: 'caseWithdrawal.request.amountDetails.partialWithdrawal.freeWithdrawalAmountOnly',
                value: WithdrawalSelectionValues.TotalFreeWithdrawal,
                generatePayloadFromSelection: generatePayloadTotalFreeWithdrawal,
            },
            {
                label: 'caseWithdrawal.request.amountDetails.partialWithdrawal.netWithdrawal',
                value: WithdrawalSelectionValues.NetWithdrawal,
                amountFieldType: AmountType.Dollar,
                generatePayloadFromSelection: generatePayloadnetWithdrawal,
            },
            {
                label: 'caseWithdrawal.request.amountDetails.partialWithdrawal.grossWithdrawal',
                value: WithdrawalSelectionValues.GrossWithdrawal,
                amountFieldType: AmountType.Dollar,
                generatePayloadFromSelection: generatePayloadgrossWithdrawal,
            },
        ];

        const formProgram = {
            clientCode: 'FLIC',
            contractNumber: '680160004',
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
            asOfDate: {
                text: null,
            },
            isValidAsOfDate: true,
        };
        render(
            <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                <FormProgramPartialWithdrawal options={partialWithdrawalOptions} selectionIdentifier={identifySelectedFormProgramOption} />
            </FormDataContext.Provider>
        );
        it('should render the title', () => {
            const sectionTitle = screen.getByText('title');
            expect(sectionTitle).toBeInTheDocument();
            expect(sectionTitle.tagName).toBe('H3');
        });

        it('should render Partial withdrawal options', async () => {
            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext, currentFormState: CaseStatus.Pending, formProgram }}>
                    <FormProgramPartialWithdrawal
                        options={partialWithdrawalOptions}
                        selectionIdentifier={identifySelectedFormProgramOption}
                    />
                </FormDataContext.Provider>
            );

            const withdrawalOptions = await screen.getByTestId('pleaseChooseOne-amountField');
            expect(withdrawalOptions).toBeInTheDocument();

            await userEvent.click(withdrawalOptions);

            const option1 = screen.getByText('caseWithdrawal.request.amountDetails.partialWithdrawal.freeWithdrawalAmountOnly', {
                ignore: 'option',
            });
            expect(option1).toBeInTheDocument();

            const option2 = screen.getByText('caseWithdrawal.request.amountDetails.partialWithdrawal.netWithdrawal', {
                ignore: 'option',
            });
            expect(option2).toBeInTheDocument();

            const option3 = screen.getByText('caseWithdrawal.request.amountDetails.partialWithdrawal.grossWithdrawal', {
                ignore: 'option',
            });
            expect(option3).toBeInTheDocument();
        });

        it('should change the payload on freeWithdrawalAmountOnly selection', async () => {
            let setMethodArgs;
            const setMockData = jest.fn(cb => {
                setMethodArgs = typeof cb === 'function' ? cb(formProgram) : cb;
                return setMethodArgs;
            });

            render(
                <FormDataContext.Provider
                    value={{ ...defaultFormDataContext, currentFormState: CaseStatus.Pending, formProgram, setFormProgram: setMockData }}
                >
                    <FormProgramPartialWithdrawal
                        options={partialWithdrawalOptions}
                        selectionIdentifier={identifySelectedFormProgramOption}
                    />
                </FormDataContext.Provider>
            );

            const withdrawalOptions = screen.getByTestId('pleaseChooseOne');
            expect(withdrawalOptions).toBeInTheDocument();

            await userEvent.click(withdrawalOptions);

            const option1 = screen.getByText('caseWithdrawal.request.amountDetails.partialWithdrawal.freeWithdrawalAmountOnly', {
                ignore: 'option',
            });

            expect(option1).toBeInTheDocument();
            await userEvent.click(option1);

            expect(setMockData).toHaveBeenCalled();
            expect(generatePayloadTotalFreeWithdrawal).toHaveBeenCalledWith('');
        });

        it('should change the payload on netWithdrawal selection', async () => {
            let setMethodArgs;
            const setMockData = jest.fn(cb => {
                setMethodArgs = typeof cb === 'function' ? cb(formProgram) : cb;
                return setMethodArgs;
            });
            render(
                <FormDataContext.Provider
                    value={{ ...defaultFormDataContext, currentFormState: CaseStatus.Pending, formProgram, setFormProgram: setMockData }}
                >
                    <FormProgramPartialWithdrawal
                        options={partialWithdrawalOptions}
                        selectionIdentifier={identifySelectedFormProgramOption}
                    />
                </FormDataContext.Provider>
            );

            const withdrawalOptions = screen.getByTestId('pleaseChooseOne');

            await userEvent.click(withdrawalOptions);

            const option1 = screen.getByText('caseWithdrawal.request.amountDetails.partialWithdrawal.netWithdrawal', {
                ignore: 'option',
            });

            expect(option1).toBeInTheDocument();
            await userEvent.click(option1);

            const amountElement = screen.getByLabelText('dollar');
            expect(amountElement).toBeInTheDocument();
            fireEvent.change(amountElement, { target: { value: '200' } });

            expect(setMockData).toHaveBeenCalled();
            expect(generatePayloadnetWithdrawal).toHaveBeenCalledWith('200');
        });

        it('should change the payload on grossWithdrawal selection', async () => {
            let setMethodArgs;
            const setMockData = jest.fn(cb => {
                setMethodArgs = typeof cb === 'function' ? cb(formProgram) : cb;
                return setMethodArgs;
            });

            render(
                <FormDataContext.Provider
                    value={{ ...defaultFormDataContext, currentFormState: CaseStatus.Pending, formProgram, setFormProgram: setMockData }}
                >
                    <FormProgramPartialWithdrawal
                        options={partialWithdrawalOptions}
                        selectionIdentifier={identifySelectedFormProgramOption}
                    />
                </FormDataContext.Provider>
            );

            const withdrawalOptions = screen.getByTestId('pleaseChooseOne');

            expect(withdrawalOptions).toBeInTheDocument();

            await userEvent.click(withdrawalOptions);
            const option1 = screen.getByText('caseWithdrawal.request.amountDetails.partialWithdrawal.grossWithdrawal', {
                ignore: 'option',
            });

            expect(option1).toBeInTheDocument();
            await userEvent.click(option1);

            const amountElement = screen.getByLabelText('dollar');
            expect(amountElement).toBeInTheDocument();
            fireEvent.change(amountElement, { target: { value: '300' } });

            expect(setMockData).toHaveBeenCalled();
            expect(generatePayloadgrossWithdrawal).toHaveBeenCalledWith('300');
        });

        it('should show contract replaced component', async () => {
            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext, currentFormState: CaseStatus.Pending, formProgram }}>
                    <FormProgramPartialWithdrawal
                        options={partialWithdrawalOptions}
                        selectionIdentifier={identifySelectedFormProgramOption}
                        showContractReplacement={true}
                    />
                </FormDataContext.Provider>
            );

            const withdrawalOptions = screen.getByTestId('pleaseChooseOne');
            expect(withdrawalOptions).toBeInTheDocument();

            const contractReplaced = screen.getByTestId('isContractReplaced');
            expect(contractReplaced).toBeInTheDocument();
        });
    });
});
