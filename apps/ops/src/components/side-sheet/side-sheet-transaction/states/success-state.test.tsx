/* eslint-disable @typescript-eslint/no-empty-function */

import { render } from '@testing-library/react';
import { useTranslation } from 'next-i18next';

import enTranslations from 'public/locales/en/common.json';
import esTranslations from 'public/locales/es/common.json';
import frTranslations from 'public/locales/fr/common.json';

import SuccessState from './success-state';

jest.mock('next-i18next', () => ({
    useTranslation: jest.fn(),
}));

describe('Success State - Translation Tests', () => {
    // Translation configurations
    const translationConfigs = {
        en: {
            translations: enTranslations,
        },
        es: {
            translations: esTranslations,
        },
        fr: {
            translations: frTranslations,
        },
    };

    describe.each([
        ['English', 'en'],
        ['Spanish', 'es'],
        ['French', 'fr'],
    ])('%s translations', (languageName, languageCode) => {
        const config =
            translationConfigs[languageCode as keyof typeof translationConfigs];

        describe('with SYSTEMATIC_PROGRAMS_TABLE flag enabled', () => {
            beforeEach(() => {
                (useTranslation as jest.Mock).mockReturnValue({
                    t: (key: string) => {
                        const keys = key.split('.');
                        let value: any = config.translations;

                        for (const k of keys) {
                            value = value?.[k];
                        }

                        return value || key;
                    },
                    i18n: {
                        language: languageCode,
                    },
                });
            });

            it(`should display msg for Premium Autopay ${languageName} cancelation`, async () => {
                const { getByText } = render(
                    <SuccessState
                        transactionType={useTranslation().t(
                            'transactions.cancelAutopay.premiumAutopayCancellationSP'
                        )}
                        onCancel={() => {}}
                    />
                );

                const expectedText =
                    config.translations.transactions.cancelAutopay.premiumAutopayCancellationSP.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });

            it(`should display msg for Loan Autopay ${languageName} cancelation`, async () => {
                const { getByText } = render(
                    <SuccessState
                        transactionType={useTranslation().t(
                            'transactions.cancelAutopay.loanAutopayCancellationSP'
                        )}
                        onCancel={() => {}}
                    />
                );

                const expectedText =
                    config.translations.transactions.cancelAutopay.loanAutopayCancellationSP.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
        });

        describe('with SYSTEMATIC_PROGRAMS_TABLE flag disabled ', () => {
            beforeEach(() => {
                (useTranslation as jest.Mock).mockReturnValue({
                    t: (key: string) => {
                        const keys = key.split('.');
                        let value: any = config.translations;

                        for (const k of keys) {
                            value = value?.[k];
                        }

                        return value || key;
                    },
                    i18n: {
                        language: languageCode,
                    },
                });
            });

            it(`should display msg for Premium Autopay ${languageName} cancelation`, async () => {
                const { getByText } = render(
                    <SuccessState
                        transactionType={useTranslation().t(
                            'transactions.cancelAutopay.premiumAutopayCancellation'
                        )}
                        onCancel={() => {}}
                    />
                );

                const expectedText =
                    config.translations.transactions.cancelAutopay.premiumAutopayCancellation.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });

            it(`should display msg for Loan Autopay ${languageName} cancelation`, async () => {
                const { getByText } = render(
                    <SuccessState
                        transactionType={useTranslation().t(
                            'transactions.cancelAutopay.loanAutopayCancellation'
                        )}
                        onCancel={() => {}}
                    />
                );

                const expectedText =
                    config.translations.transactions.cancelAutopay.loanAutopayCancellation.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
        });
    });
});
