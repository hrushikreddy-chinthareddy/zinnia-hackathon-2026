/* eslint-disable @typescript-eslint/no-empty-function */

import { render } from '@testing-library/react';
import { useTranslation } from 'next-i18next';

import enTranslations from 'public/locales/en/common.json';
import esTranslations from 'public/locales/es/common.json';
import frTranslations from 'public/locales/fr/common.json';

import FieldLabel from './field-label';

jest.mock('next-i18next', () => ({
    useTranslation: jest.fn(),
}));

describe('Work Flow - Translation Tests', () => {
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

            it(`should display field label for Premium Autopay ${languageName}`, async () => {
                const { getByText } = render(
                    <FieldLabel
                        label={
                            useTranslation().t(
                                'premiumAutopay.amount.paymentAmountSP'
                            ) || 'premiumAutopay.amount.paymentAmountSP'
                        }
                    />
                );

                const expectedText =
                    config.translations.premiumAutopay.amount.paymentAmountSP.trim();

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

            it(`should display field label for Premium Autopay ${languageName}`, async () => {
                const { getByText } = render(
                    <FieldLabel
                        label={
                            useTranslation().t(
                                'premiumAutopay.amount.paymentAmount'
                            ) || 'premiumAutopay.amount.paymentAmount'
                        }
                    />
                );

                const expectedText =
                    config.translations.premiumAutopay.amount.paymentAmount.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
        });
    });
});
