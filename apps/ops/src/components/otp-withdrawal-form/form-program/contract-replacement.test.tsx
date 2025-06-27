import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import ContractReplacement from './contract-replacement';

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

describe('ContractReplacement component', () => {
    describe('DLIC Form', () => {
        it('should render contract replaced field', () => {
            const setMockData = jest.fn();

            const mockData = {
                ...CaseDetails.data.formRequest.formProgram,
                isContractReplaced: { text: false },
            };
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formProgram: mockData,
                        setFormProgram: setMockData,
                    }}
                >
                    <ContractReplacement />
                </FormDataContext.Provider>
            );

            const contractReplacedElement =
                screen.getByTestId('isContractReplaced');
            expect(contractReplacedElement).toBeInTheDocument();
            expect(contractReplacedElement).not.toBeChecked();
            fireEvent.click(contractReplacedElement);
            expect(contractReplacedElement).toBeChecked();
        });
    });
});
