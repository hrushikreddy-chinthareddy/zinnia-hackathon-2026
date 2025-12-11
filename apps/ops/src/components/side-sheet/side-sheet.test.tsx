/* eslint-disable @typescript-eslint/no-empty-function */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'next-i18next';

import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import enTranslations from 'public/locales/en/common.json';
import esTranslations from 'public/locales/es/common.json';
import frTranslations from 'public/locales/fr/common.json';

import SideSheet from './side-sheet'; // Adjust the import path as needed
import Popover from '../popover/popover';
import Typography, { TypographyVariant } from '../typography/typography';

jest.mock('next-i18next', () => ({
    useTranslation: jest.fn(),
}));

describe('SideSheet', () => {
    beforeEach(() => {
        (useTranslation as jest.Mock).mockReturnValue({
            t: (key: string) => key,
            i18n: {
                language: DEFAULT_LOCALE,
            },
        });
    });
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

            it(`should display tittle in ${languageName} for cancel Premium Autopay`, async () => {
                const { getByText } = render(
                    <SideSheet
                        open
                        handleClose={() => {}}
                        headerElement={
                            <Typography variant={TypographyVariant.H2}>
                                {useTranslation().t(
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
                const { getByText } = render(
                    <SideSheet
                        open
                        handleClose={() => {}}
                        headerElement={
                            <Typography variant={TypographyVariant.H2}>
                                {useTranslation().t(
                                    'allFields.cancelLoanProgram'
                                )}
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

            it(`should display tittle in ${languageName} for cancel Premium Autopay`, async () => {
                const { getByText } = render(
                    <SideSheet
                        open
                        handleClose={() => {}}
                        headerElement={
                            <Typography variant={TypographyVariant.H2}>
                                {useTranslation().t(
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
                const { getByText } = render(
                    <SideSheet
                        open
                        handleClose={() => {}}
                        headerElement={
                            <Typography variant={TypographyVariant.H2}>
                                {useTranslation().t(
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
