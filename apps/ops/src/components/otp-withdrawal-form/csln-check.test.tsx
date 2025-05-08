import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { FormDataContext, defaultFormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { CaseStatus } from '@deps/models/case/withdrawal/case';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import CslnCheck from './csln-check';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

describe('CslnCheck component', () => {
    describe('FLIC Form', () => {
        it('should render the title', () => {
            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                    <CslnCheck />
                </FormDataContext.Provider>
            );
            const sectionTitle = screen.getByTestId('data-testid-csln-title');
            expect(sectionTitle).toBeInTheDocument();
            expect(sectionTitle.tagName).toBe('H3');
        });

        it('should render Csln options', () => {
            const setMockData = jest.fn();
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formSignature: CaseDetails.data.formRequest.formSignature,
                        setFormSignature: setMockData,
                    }}
                >
                    <CslnCheck />
                </FormDataContext.Provider>
            );
            const validOptionElement = screen.getByTestId('button-group-label-test-id-valid');
            expect(validOptionElement).toBeInTheDocument();

            const notvalidOptionElement = screen.getByTestId('button-group-label-test-id-notValid');
            expect(notvalidOptionElement).toBeInTheDocument();

            expect(setMockData).toHaveBeenCalledWith({
                ...CaseDetails.data.formRequest.formSignature,
                isCheckCSNLValid: null,
            });
        });

        it('should handle valid option selection', () => {
            const setMockData = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formSignature: CaseDetails.data.formRequest.formSignature,
                        setFormSignature: setMockData,
                        currentFormState: CaseStatus.Pending,
                    }}
                >
                    <CslnCheck />
                </FormDataContext.Provider>
            );
            const validElement = screen.getByTestId('button-group-label-test-id-valid');

            fireEvent.click(validElement);
            expect(validElement).toBeChecked();

            expect(setMockData).toHaveBeenCalledWith({
                ...CaseDetails.data.formRequest.formSignature,
                isCheckCSNLValid: true,
            });
        });

        it('should handle not-valid option selection', () => {
            const setMockData = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formSignature: CaseDetails.data.formRequest.formSignature,
                        setFormSignature: setMockData,
                        currentFormState: CaseStatus.Pending,
                    }}
                >
                    <CslnCheck />
                </FormDataContext.Provider>
            );
            const notValidElement = screen.getByTestId('button-group-label-test-id-notValid');

            fireEvent.click(notValidElement);
            expect(notValidElement).toBeChecked();

            expect(setMockData).toHaveBeenCalledWith({
                ...CaseDetails.data.formRequest.formSignature,
                isCheckCSNLValid: false,
            });
        });
    });
});
