/* eslint-disable @typescript-eslint/no-empty-function */

import { render } from '@testing-library/react';
import { useTranslation } from 'next-i18next';

import enTranslations from 'public/locales/en/common.json';
import esTranslations from 'public/locales/es/common.json';
import frTranslations from 'public/locales/fr/common.json';

import WorkflowCard from './workflow-card';

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

            it(`should display tittle for Premium Autopay ${languageName} when is setUp`, async () => {
                const { getByText } = render(
                    <WorkflowCard
                        title={useTranslation().t(
                            'premiumAutopay.start.titleStartSP'
                        )}
                    />
                );

                const expectedText =
                    config.translations.premiumAutopay.start.titleStartSP.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display tittle for Premium Autopay ${languageName} when is manage`, async () => {
                const { getByText } = render(
                    <WorkflowCard
                        title={useTranslation().t(
                            'premiumAutopay.start.titleManageSP'
                        )}
                    />
                );

                const expectedText =
                    config.translations.premiumAutopay.start.titleManageSP.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display tittle for Loan Autopay ${languageName} when is setUp`, async () => {
                const { getByText } = render(
                    <WorkflowCard
                        title={useTranslation().t(
                            'loanAutopay.start.titleStartSP'
                        )}
                    />
                );

                const expectedText =
                    config.translations.loanAutopay.start.titleStartSP.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display tittle for Loan Autopay ${languageName} when is manage`, async () => {
                const { getByText } = render(
                    <WorkflowCard
                        title={useTranslation().t(
                            'loanAutopay.start.titleManageSP'
                        )}
                    />
                );

                const expectedText =
                    config.translations.loanAutopay.start.titleManageSP.trim();

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

            it(`should display tittle for Premium Autopay ${languageName} when is setUp`, async () => {
                const { getByText } = render(
                    <WorkflowCard
                        title={useTranslation().t(
                            'premiumAutopay.start.titleStart'
                        )}
                    />
                );

                const expectedText =
                    config.translations.premiumAutopay.start.titleStart.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display tittle for Premium Autopay ${languageName} when is manage`, async () => {
                const { getByText } = render(
                    <WorkflowCard
                        title={useTranslation().t(
                            'premiumAutopay.start.titleManage'
                        )}
                    />
                );

                const expectedText =
                    config.translations.premiumAutopay.start.titleManage.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display tittle for Loan Autopay ${languageName} when is setUp`, async () => {
                const { getByText } = render(
                    <WorkflowCard
                        title={useTranslation().t(
                            'loanAutopay.start.titleStart'
                        )}
                    />
                );

                const expectedText =
                    config.translations.loanAutopay.start.titleStart.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display tittle for Loan Autopay ${languageName} when is manage`, async () => {
                const { getByText } = render(
                    <WorkflowCard
                        title={useTranslation().t(
                            'loanAutopay.start.titleManage'
                        )}
                    />
                );

                const expectedText =
                    config.translations.loanAutopay.start.titleManage.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
        });
    });
});
