import { fireEvent, render, screen } from '@testing-library/react';
import { TFunctionDetailedResult } from 'i18next';
import { TFunction } from 'next-i18next';

import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';

import CreateDisclosure from './create-disclosure';
import { Disclosure } from './create-disclosure.types';
import getMassMutualReg60Config from '../../mass-mutual/mass-mutual-reg60-form-helpers';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));
describe('CreateDisclosure', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'warn').mockImplementation();
    });

    it('should render the component without crashing when disclosure is an empty array', () => {
        const discloureData: Disclosure = {
            proposedAnnuitizationQuote: {} as any,
            contractComparison: [],
        };
        const setContractComparisons = jest.fn();
        const t: TFunction = (key: string | string[]) =>
            key as unknown as TFunctionDetailedResult<string>;

        const { disclosureConfig } = getMassMutualReg60Config(t);

        render(
            <CreateDisclosure
                disclosure={discloureData}
                onDisclosureChange={setContractComparisons}
                formConfig={disclosureConfig}
            />
        );
        expect(screen.queryByTestId('disclosure-title')).toBeInTheDocument();
    });

    it('should handle an empty list of contract comparisons', () => {
        const discloureData: Disclosure = {
            proposedAnnuitizationQuote: {
                annuityPaymentAmount: 0,
                firstPaymentDate: '',
                paymentFrequency: '',
                incomeOption: '',
                periodCertainYears: '',
                typeOfPayment: '',
            },
            contractComparison: [],
        };
        const setContractComparisons = jest.fn();
        const t: TFunction = (key: string | string[]) =>
            key as unknown as TFunctionDetailedResult<string>;

        const { disclosureConfig } = getMassMutualReg60Config(t);
        render(
            <CreateDisclosure
                disclosure={discloureData}
                onDisclosureChange={setContractComparisons}
                formConfig={disclosureConfig}
            />
        );

        expect(
            screen.queryByTestId('comparison-contract')
        ).not.toBeInTheDocument();
    });

    it('should show list of contract comparisons', () => {
        const discloureData: Disclosure = {
            proposedAnnuitizationQuote: {
                annuityPaymentAmount: 0,
                firstPaymentDate: '',
                paymentFrequency: '',
                incomeOption: '',
                periodCertainYears: '',
                typeOfPayment: '',
            },
            contractComparison: [
                {
                    comparisonId: 1,
                    comparisonType: 'VARIABLE_TO_FIXED',
                    partialRequest: false,
                    goodFaithEstimateRequired: false,
                    companyName: '',
                    companyPhoneNumber: '',
                    contractNumber: '',
                    issueDate: '',
                    accountValue: '',
                    surrenderCharge: {
                        applicable: false,
                    },
                    mvaAmount: {
                        applicable: false,
                    },
                    surrenderValue: '',
                    annuitizationValueReceived: true,
                    annuitizationQuote: {
                        annuityPaymentAmount: '',
                        firstPaymentDate: '',
                        paymentFrequency: '',
                        incomeOption: '',
                        typeOfPayment: '',
                        periodCertainYears: '',
                    },
                    carrierBenefits: {
                        surrenderBenefit: [
                            {
                                period: '5YEAR',
                                returnGuarRate: '',
                                returnCurrRate: '',
                                return0Prct: '',
                                return6Prct: '',
                                return12Prct: '',
                            },
                            {
                                period: '10YEAR',
                                returnGuarRate: '',
                                returnCurrRate: '',
                                return0Prct: '',
                                return6Prct: '',
                                return12Prct: '',
                            },
                        ],
                        deathBenefit: [
                            {
                                period: '5YEAR',
                                returnGuarRate: '',
                                returnCurrRate: '',
                                return0Prct: '',
                                return6Prct: '',
                                return12Prct: '',
                            },
                            {
                                period: '10YEAR',
                                returnGuarRate: '',
                                returnCurrRate: '',
                                return0Prct: '',
                                return6Prct: '',
                                return12Prct: '',
                            },
                        ],
                    },
                },
            ],
        };
        const setContractComparisons = jest.fn();
        const t: TFunction = (key: string | string[]) =>
            key as unknown as TFunctionDetailedResult<string>;

        const { disclosureConfig } = getMassMutualReg60Config(t);
        render(
            <CreateDisclosure
                disclosure={discloureData}
                onDisclosureChange={setContractComparisons}
                formConfig={disclosureConfig}
            />
        );

        expect(screen.queryByTestId('comparison-contract')).toBeInTheDocument();
    });

    it.skip('should allow the user to add a new comparison contract', () => {
        const discloureData: Disclosure = {
            proposedAnnuitizationQuote: {
                annuityPaymentAmount: 0,
                firstPaymentDate: '',
                paymentFrequency: '',
                incomeOption: '',
                periodCertainYears: '',
                typeOfPayment: '',
            },
            contractComparison: [
                {
                    comparisonId: 1,
                    comparisonType: 'VARIABLE_TO_FIXED',
                    partialRequest: false,
                    goodFaithEstimateRequired: false,
                    companyName: '',
                    companyPhoneNumber: '',
                    contractNumber: '',
                    issueDate: '',
                    accountValue: '',
                    surrenderCharge: {
                        applicable: false,
                    },
                    mvaAmount: {
                        applicable: false,
                    },
                    surrenderValue: '',
                    annuitizationValueReceived: true,
                    annuitizationQuote: {
                        annuityPaymentAmount: '',
                        firstPaymentDate: '',
                        paymentFrequency: '',
                        incomeOption: '',
                        typeOfPayment: '',
                        periodCertainYears: '',
                    },
                    carrierBenefits: {
                        surrenderBenefit: [
                            {
                                period: '5YEAR',
                                returnGuarRate: '',
                                returnCurrRate: '',
                                return0Prct: '',
                                return6Prct: '',
                                return12Prct: '',
                            },
                            {
                                period: '10YEAR',
                                returnGuarRate: '',
                                returnCurrRate: '',
                                return0Prct: '',
                                return6Prct: '',
                                return12Prct: '',
                            },
                        ],
                        deathBenefit: [
                            {
                                period: '5YEAR',
                                returnGuarRate: '',
                                returnCurrRate: '',
                                return0Prct: '',
                                return6Prct: '',
                                return12Prct: '',
                            },
                            {
                                period: '10YEAR',
                                returnGuarRate: '',
                                returnCurrRate: '',
                                return0Prct: '',
                                return6Prct: '',
                                return12Prct: '',
                            },
                        ],
                    },
                },
            ],
        };
        const setContractComparisons = jest.fn();
        const t: TFunction = (key: string | string[]) =>
            key as unknown as TFunctionDetailedResult<string>;

        const { disclosureConfig } = getMassMutualReg60Config(t);

        render(
            <CreateDisclosure
                disclosure={discloureData}
                onDisclosureChange={setContractComparisons}
                formConfig={disclosureConfig}
            />
        );

        fireEvent.click(screen.getByText('addNewComparison'));
        expect(
            screen.getAllByTestId('comparison-contract')[0]
        ).toBeInTheDocument();
        fireEvent.click(screen.getByText('addNewComparison'));
    });

    // Removes the specified comparison contract from the contract comparison list
    it('should remove the specified comparison contract from the contract comparison list', async () => {
        const discloureData: Disclosure = {
            proposedAnnuitizationQuote: {
                annuityPaymentAmount: 0,
                firstPaymentDate: '',
                paymentFrequency: '',
                incomeOption: '',
                periodCertainYears: '',
                typeOfPayment: '',
            },
            contractComparison: [
                {
                    comparisonId: 1,
                    comparisonType: 'VARIABLE_TO_FIXED',
                    partialRequest: false,
                    goodFaithEstimateRequired: false,
                    companyName: '',
                    companyPhoneNumber: '',
                    contractNumber: '',
                    issueDate: '',
                    accountValue: '',
                    surrenderCharge: {
                        applicable: false,
                    },
                    mvaAmount: {
                        applicable: false,
                    },
                    surrenderValue: '',
                    annuitizationValueReceived: true,
                    annuitizationQuote: {
                        annuityPaymentAmount: '',
                        firstPaymentDate: '',
                        paymentFrequency: '',
                        incomeOption: '',
                        typeOfPayment: '',
                        periodCertainYears: '',
                    },
                    carrierBenefits: {
                        surrenderBenefit: [
                            {
                                period: '5YEAR',
                                returnGuarRate: '',
                                returnCurrRate: '',
                                return0Prct: '',
                                return6Prct: '',
                                return12Prct: '',
                            },
                            {
                                period: '10YEAR',
                                returnGuarRate: '',
                                returnCurrRate: '',
                                return0Prct: '',
                                return6Prct: '',
                                return12Prct: '',
                            },
                        ],
                        deathBenefit: [
                            {
                                period: '5YEAR',
                                returnGuarRate: '',
                                returnCurrRate: '',
                                return0Prct: '',
                                return6Prct: '',
                                return12Prct: '',
                            },
                            {
                                period: '10YEAR',
                                returnGuarRate: '',
                                returnCurrRate: '',
                                return0Prct: '',
                                return6Prct: '',
                                return12Prct: '',
                            },
                        ],
                    },
                },
                {
                    comparisonId: 2,
                    comparisonType: 'VARIABLE_TO_FIXED',
                    partialRequest: false,
                    goodFaithEstimateRequired: false,
                    companyName: '',
                    companyPhoneNumber: '',
                    contractNumber: '',
                    issueDate: '',
                    accountValue: '',
                    surrenderCharge: {
                        applicable: false,
                    },
                    mvaAmount: {
                        applicable: false,
                    },
                    surrenderValue: '',
                    annuitizationValueReceived: true,
                    annuitizationQuote: {
                        annuityPaymentAmount: '',
                        firstPaymentDate: '',
                        paymentFrequency: '',
                        incomeOption: '',
                        typeOfPayment: '',
                        periodCertainYears: '',
                    },
                    carrierBenefits: {
                        surrenderBenefit: [
                            {
                                period: '5YEAR',
                                returnGuarRate: '',
                                returnCurrRate: '',
                                return0Prct: '',
                                return6Prct: '',
                                return12Prct: '',
                            },
                            {
                                period: '10YEAR',
                                returnGuarRate: '',
                                returnCurrRate: '',
                                return0Prct: '',
                                return6Prct: '',
                                return12Prct: '',
                            },
                        ],
                        deathBenefit: [
                            {
                                period: '5YEAR',
                                returnGuarRate: '',
                                returnCurrRate: '',
                                return0Prct: '',
                                return6Prct: '',
                                return12Prct: '',
                            },
                            {
                                period: '10YEAR',
                                returnGuarRate: '',
                                returnCurrRate: '',
                                return0Prct: '',
                                return6Prct: '',
                                return12Prct: '',
                            },
                        ],
                    },
                },
            ],
        };
        const setContractComparisons = jest.fn();
        const t: TFunction = (key: string | string[]) =>
            key as unknown as TFunctionDetailedResult<string>;

        const { disclosureConfig } = getMassMutualReg60Config(t);

        render(
            <CreateDisclosure
                disclosure={discloureData}
                onDisclosureChange={setContractComparisons}
                formConfig={disclosureConfig}
            />
        );

        fireEvent.click(screen.getByTestId('remove-contract'));

        expect(
            screen.getAllByTestId('comparison-contract')[0]
        ).toBeInTheDocument();
        expect(
            screen.getAllByTestId('comparison-contract')[1]
        ).toBeInTheDocument();
    });
});
