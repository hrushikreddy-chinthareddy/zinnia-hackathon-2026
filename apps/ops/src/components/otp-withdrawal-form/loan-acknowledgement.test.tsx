import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { CaseStatus } from '@deps/models/case/withdrawal/case';

import LoanAcknowledgement from './loan-acknowledgement';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

describe('formLoan component', () => {
    describe('FLIC Form', () => {
        it('should render the title', () => {
            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                    <LoanAcknowledgement />
                </FormDataContext.Provider>
            );
            const sectionTitle = screen.getByText('loanAcknowledgement.title');
            expect(sectionTitle).toBeInTheDocument();
            expect(sectionTitle.tagName).toBe('H3');
        });

        it('should render loan checkbox', () => {
            const setMockData = jest.fn();
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        setFormLoan: setMockData,
                    }}
                >
                    <LoanAcknowledgement />
                </FormDataContext.Provider>
            );
            const acknowledgementElement = screen.getByLabelText(
                'loanAcknowledgement.acknowledgement'
            );
            expect(acknowledgementElement).toBeInTheDocument();
            expect(acknowledgementElement).not.toBeChecked();

            expect(setMockData).toHaveBeenCalledWith({
                isLoanAck: { text: false },
            });
        });

        it('should render the payload correctly on checkbox event', () => {
            const formLoan = {
                isLoanAck: {
                    text: false,
                },
            };
            const setMockData = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formLoan,
                        setFormLoan: setMockData,
                    }}
                >
                    <LoanAcknowledgement />
                </FormDataContext.Provider>
            );
            const acknowledgementElement =
                screen.getByTestId('acknowledgement');
            expect(acknowledgementElement).not.toBeChecked();

            fireEvent.click(acknowledgementElement);
            expect(acknowledgementElement).toBeChecked();

            // expect(setMockData).toHaveBeenCalled();
            expect(setMockData).toHaveBeenCalledWith({
                isLoanAck: { text: true },
            });
        });
    });
});
