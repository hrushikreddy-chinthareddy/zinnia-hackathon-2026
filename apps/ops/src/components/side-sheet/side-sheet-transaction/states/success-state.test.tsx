/* eslint-disable @typescript-eslint/no-empty-function */

import { render } from '@testing-library/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from 'public/locales/en/common.json';
import esTranslations from 'public/locales/es/common.json';
import frTranslations from 'public/locales/fr/common.json';

import SuccessState from './success-state';

beforeAll(async () => {
    await i18n.use(initReactI18next).init({
        lng: 'en',
        fallbackLng: 'en',
        resources: {
            en: { common: enTranslations },
            es: { common: esTranslations },
            fr: { common: frTranslations },
        },
        defaultNS: 'common',
        interpolation: {
            escapeValue: false,
        },
    });
});

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
            it(`should display msg for Premium Autopay ${languageName} cancelation`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <SuccessState
                        transactionType={i18n.t(
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
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <SuccessState
                        transactionType={i18n.t(
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
            it(`should display msg for Premium Autopay ${languageName} cancelation`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <SuccessState
                        transactionType={i18n.t(
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
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <SuccessState
                        transactionType={i18n.t(
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
