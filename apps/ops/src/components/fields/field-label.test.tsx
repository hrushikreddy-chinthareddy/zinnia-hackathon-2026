/* eslint-disable @typescript-eslint/no-empty-function */

import { render } from '@testing-library/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from 'public/locales/en/common.json';
import esTranslations from 'public/locales/es/common.json';
import frTranslations from 'public/locales/fr/common.json';

import FieldLabel from './field-label';

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
            it(`should display field label for Premium Autopay ${languageName}`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <FieldLabel
                        label={
                            i18n.t(
                                'allFields.premiumAutopaySystematicProgramPaymentAmount'
                            ) ||
                            'allFields.premiumAutopaySystematicProgramPaymentAmount'
                        }
                    />
                );

                const expectedText =
                    config.translations.allFields.premiumAutopaySystematicProgramPaymentAmount.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
        });

        describe('with SYSTEMATIC_PROGRAMS_TABLE flag disabled ', () => {
            it(`should display field label for Premium Autopay ${languageName}`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <FieldLabel
                        label={
                            i18n.t('allFields.premiumAutopayPaymentAmount') ||
                            'allFields.premiumAutopayPaymentAmount'
                        }
                    />
                );

                const expectedText =
                    config.translations.allFields.premiumAutopayPaymentAmount.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
        });
    });
});
