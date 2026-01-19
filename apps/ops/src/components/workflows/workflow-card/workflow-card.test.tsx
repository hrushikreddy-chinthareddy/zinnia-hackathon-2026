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
                        title={i18n.t(
                            'allFields.premiumAutopaySystematicProgramTitleStart'
                        )}
                    />
                );

                const expectedText =
                    config.translations.allFields.premiumAutopaySystematicProgramTitleStart.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display tittle for Premium Autopay ${languageName} when is manage`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <WorkflowCard
                        title={i18n.t(
                            'allFields.premiumAutopaySystematicProgramManageStart'
                        )}
                    />
                );

                const expectedText =
                    config.translations.allFields.premiumAutopaySystematicProgramManageStart.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display tittle for Loan Autopay ${languageName} when is setUp`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <WorkflowCard
                        title={i18n.t(
                            'allFields.loanAutopaySystematicProgramTitleStart'
                        )}
                    />
                );

                const expectedText =
                    config.translations.allFields.loanAutopaySystematicProgramTitleStart.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display tittle for Loan Autopay ${languageName} when is manage`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <WorkflowCard
                        title={i18n.t(
                            'allFields.loanAutopaySystematicProgramManageStart'
                        )}
                    />
                );

                const expectedText =
                    config.translations.allFields.loanAutopaySystematicProgramManageStart.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
        });

        describe('with SYSTEMATIC_PROGRAMS_TABLE flag disabled ', () => {
            it(`should display tittle for Premium Autopay ${languageName} when is setUp`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <WorkflowCard
                        title={i18n.t('allFields.premiumAutopayTitleStart')}
                    />
                );

                const expectedText =
                    config.translations.allFields.premiumAutopayTitleStart.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display tittle for Premium Autopay ${languageName} when is manage`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <WorkflowCard
                        title={i18n.t('allFields.premiumAutopayManageStart')}
                    />
                );

                const expectedText =
                    config.translations.allFields.premiumAutopayManageStart.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display tittle for Loan Autopay ${languageName} when is setUp`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <WorkflowCard
                        title={i18n.t('allFields.loanAutopayTitleStart')}
                    />
                );

                const expectedText =
                    config.translations.allFields.loanAutopayTitleStart.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display tittle for Loan Autopay ${languageName} when is manage`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <WorkflowCard
                        title={i18n.t('allFields.loanAutopayManageStart')}
                    />
                );

                const expectedText =
                    config.translations.allFields.loanAutopayManageStart.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
        });
    });
});
