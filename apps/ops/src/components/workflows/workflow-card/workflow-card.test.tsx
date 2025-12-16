/* eslint-disable @typescript-eslint/no-empty-function */

import { render } from '@testing-library/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from 'public/locales/en/common.json';
import esTranslations from 'public/locales/es/common.json';
import frTranslations from 'public/locales/fr/common.json';

import WorkflowCard from './workflow-card';

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
            it(`should display tittle for Premium Autopay ${languageName} when is setUp`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <WorkflowCard
                        title={i18n.t('premiumAutopay.start.titleStartSP')}
                    />
                );

                const expectedText =
                    config.translations.premiumAutopay.start.titleStartSP.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display tittle for Premium Autopay ${languageName} when is manage`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <WorkflowCard
                        title={i18n.t('premiumAutopay.start.titleManageSP')}
                    />
                );

                const expectedText =
                    config.translations.premiumAutopay.start.titleManageSP.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display tittle for Loan Autopay ${languageName} when is setUp`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <WorkflowCard
                        title={i18n.t('loanAutopay.start.titleStartSP')}
                    />
                );

                const expectedText =
                    config.translations.loanAutopay.start.titleStartSP.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display tittle for Loan Autopay ${languageName} when is manage`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <WorkflowCard
                        title={i18n.t('loanAutopay.start.titleManageSP')}
                    />
                );

                const expectedText =
                    config.translations.loanAutopay.start.titleManageSP.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
        });

        describe('with SYSTEMATIC_PROGRAMS_TABLE flag disabled ', () => {
            it(`should display tittle for Premium Autopay ${languageName} when is setUp`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <WorkflowCard
                        title={i18n.t('premiumAutopay.start.titleStart')}
                    />
                );

                const expectedText =
                    config.translations.premiumAutopay.start.titleStart.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display tittle for Premium Autopay ${languageName} when is manage`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <WorkflowCard
                        title={i18n.t('premiumAutopay.start.titleManage')}
                    />
                );

                const expectedText =
                    config.translations.premiumAutopay.start.titleManage.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display tittle for Loan Autopay ${languageName} when is setUp`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <WorkflowCard
                        title={i18n.t('loanAutopay.start.titleStart')}
                    />
                );

                const expectedText =
                    config.translations.loanAutopay.start.titleStart.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display tittle for Loan Autopay ${languageName} when is manage`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <WorkflowCard
                        title={i18n.t('loanAutopay.start.titleManage')}
                    />
                );

                const expectedText =
                    config.translations.loanAutopay.start.titleManage.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
        });
    });
});
