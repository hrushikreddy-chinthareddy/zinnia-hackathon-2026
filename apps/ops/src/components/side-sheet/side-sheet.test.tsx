/* eslint-disable @typescript-eslint/no-empty-function */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from 'public/locales/en/common.json';
import esTranslations from 'public/locales/es/common.json';
import frTranslations from 'public/locales/fr/common.json';

import SideSheet from './side-sheet'; // Adjust the import path as needed
import Popover from '../popover/popover';
import Typography, { TypographyVariant } from '../typography/typography';

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

describe('SideSheet', () => {
    test('should disable scroll when opened and enable when closed', () => {
        const { rerender } = render(
            <SideSheet open={false} handleClose={() => {}} />
        );

        // Scroll should be enabled initially
        expect(document.documentElement.style.overflow).toBe('');

        rerender(<SideSheet open={true} handleClose={() => {}} />);

        // Scroll should be disabled when SideSheet is open
        expect(document.documentElement.style.overflow).toBe('hidden');

        rerender(<SideSheet open={false} handleClose={() => {}} />);

        // Scroll should be enabled when SideSheet is closed
        expect(document.documentElement.style.overflow).toBe('');
    });

    test('popovers should be visible when clicked', async () => {
        render(
            <SideSheet open handleClose={() => {}}>
                Children
                <Popover body="Popover content" title="Popover title">
                    Popover trigger
                </Popover>
            </SideSheet>
        );

        // match z-{number}
        const regex = new RegExp('z-\\d+');

        const children = screen.getByText('Children');
        // if a match exists- returns an array- index 0 is the matched string
        const childrenZIndexValue =
            Number(children.className.match(regex)?.[0].substring(2)) ?? 0;

        userEvent.click(screen.getByText('Popover trigger'));

        const popover = await screen.findByTestId('popover-content-test-id');
        // if a match exists- returns an array- index 0 is the matched string
        const popoverZIndexValue =
            Number(popover.className.match(regex)?.[0].substring(2)) ?? 0;

        expect(popoverZIndexValue).toBeGreaterThanOrEqual(childrenZIndexValue);
    });
});

describe('Side Sheets - Translation Tests', () => {
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
            it(`should display tittle in ${languageName} for cancel Premium Autopay`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <SideSheet
                        open
                        handleClose={() => {}}
                        headerElement={
                            <Typography variant={TypographyVariant.H2}>
                                {i18n.t(
                                    'premium.upcoming.cancelPremiumAutopayTitleSP'
                                )}
                            </Typography>
                        }
                    />
                );

                const expectedText =
                    config.translations.premium.upcoming.cancelPremiumAutopayTitleSP.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display tittle in ${languageName} for cancel Loan Autopay`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <SideSheet
                        open
                        handleClose={() => {}}
                        headerElement={
                            <Typography variant={TypographyVariant.H2}>
                                {i18n.t('allFields.cancelLoanProgram')}
                            </Typography>
                        }
                    />
                );

                const expectedText =
                    config.translations.allFields.cancelLoanProgram.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
        });

        describe('with SYSTEMATIC_PROGRAMS_TABLE flag disabled ', () => {
            it(`should display tittle in ${languageName} for cancel Premium Autopay`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <SideSheet
                        open
                        handleClose={() => {}}
                        headerElement={
                            <Typography variant={TypographyVariant.H2}>
                                {i18n.t(
                                    'premium.upcoming.cancelPremiumAutopayTitle'
                                )}
                            </Typography>
                        }
                    />
                );

                const expectedText =
                    config.translations.premium.upcoming.cancelPremiumAutopayTitle.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });

            it(`should display tittle in ${languageName} for cancel Loan Autopay`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <SideSheet
                        open
                        handleClose={() => {}}
                        headerElement={
                            <Typography variant={TypographyVariant.H2}>
                                {i18n.t(
                                    'premium.upcoming.cancelLoanAutopayTitle'
                                )}
                            </Typography>
                        }
                    />
                );

                const expectedText =
                    config.translations.premium.upcoming.cancelLoanAutopayTitle.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
        });
    });
});
