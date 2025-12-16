import { render } from '@testing-library/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from 'public/locales/en/common.json';
import esTranslations from 'public/locales/es/common.json';
import frTranslations from 'public/locales/fr/common.json';

import AssistiveText, { AssistiveTextVariant } from './assistive-text';

describe('AssistiveText', () => {
    it('renders a default variant', () => {
        const { getByText, getByTestId } = render(
            <AssistiveText
                text="No Variant"
                data-testid={'assistiveTextComponent'}
            />
        );
        const assistiveTextComponent = getByTestId('assistiveTextComponent');
        const icon = getByTestId('check-icon');
        const text = getByText('No Variant');

        expect(assistiveTextComponent).toHaveClass(
            'caption-selected flex w-full flex-row items-start gap-1'
        );
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('width', '16');
        expect(icon).toHaveAttribute('height', '16');
        expect(text).toBeInTheDocument();
    });

    it('renders a brand Variant', () => {
        const { getByText, getByTestId } = render(
            <AssistiveText
                text="Brand Text"
                variant={AssistiveTextVariant.Brand}
                data-testid={'assistiveTextComponent'}
            />
        );
        const assistiveTextComponent = getByTestId('assistiveTextComponent');
        const icon = getByTestId('check-icon');
        const text = getByText('Brand Text');

        expect(assistiveTextComponent).toHaveClass('text-secondary');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('width', '16');
        expect(icon).toHaveAttribute('height', '16');
        expect(text).toBeInTheDocument();
    });

    it('renders default variant with default check icon', () => {
        const { getByText, getByTestId } = render(
            <AssistiveText
                text="Default Text"
                variant={AssistiveTextVariant.Default}
                data-testid={'assistiveTextComponent'}
            />
        );
        const assistiveTextComponent = getByTestId('assistiveTextComponent');
        const icon = getByTestId('check-icon');
        const text = getByText('Default Text');

        expect(assistiveTextComponent).toHaveClass('text-gray-900');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('width', '16');
        expect(icon).toHaveAttribute('height', '16');
        expect(text).toBeInTheDocument();
    });

    it('renders warning variant with default circle info icon', () => {
        const { getByTestId } = render(
            <AssistiveText
                text="Warning Text"
                variant={AssistiveTextVariant.Warning}
                data-testid={'assistiveTextComponent'}
            />
        );
        const assistiveTextComponent = getByTestId('assistiveTextComponent');
        const icon = getByTestId('circle-info-icon');

        expect(assistiveTextComponent).toHaveClass('text-semantic-warning');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('width', '16');
        expect(icon).toHaveAttribute('height', '16');
    });

    it('renders info variant with alert exclamation icon', () => {
        const { getByTestId } = render(
            <AssistiveText
                text="Info Text"
                variant={AssistiveTextVariant.Info}
                data-testid={'assistiveTextComponent'}
            />
        );
        const assistiveTextComponent = getByTestId('assistiveTextComponent');
        const icon = getByTestId('alert-exclamation-icon');

        expect(assistiveTextComponent).toHaveClass('text-semantic-info');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('width', '16');
        expect(icon).toHaveAttribute('height', '16');
    });

    it('renders error variant with hex exclamation icon', () => {
        const { getByTestId } = render(
            <AssistiveText
                text="Error Text"
                variant={AssistiveTextVariant.Error}
                data-testid={'assistiveTextComponent'}
            />
        );
        const assistiveTextComponent = getByTestId('assistiveTextComponent');
        const icon = getByTestId('hex-exclamation-icon');

        expect(assistiveTextComponent).toHaveClass('text-semantic-error');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('width', '16');
        expect(icon).toHaveAttribute('height', '16');
    });

    it('renders success variant with custom icon override', () => {
        const customIcon = <span data-testid="custom-icon">Custom Icon</span>;
        const { getByTestId, queryByTestId } = render(
            <AssistiveText
                text="Success Text"
                variant={AssistiveTextVariant.Success}
                iconOverride={customIcon}
                data-testid={'assistiveTextComponent'}
            />
        );
        const assistiveTextComponent = getByTestId('assistiveTextComponent');
        const icon = queryByTestId('circle-check-icon');
        const customIconElement = getByTestId('custom-icon');

        expect(assistiveTextComponent).toHaveClass('text-semantic-success');
        expect(icon).not.toBeInTheDocument();
        expect(customIconElement).toBeInTheDocument();
        expect(customIconElement).toHaveTextContent('Custom Icon');
    });
});

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

describe('assistive text - Translation Tests', () => {
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
            it(`should display missing amount error msg in ${languageName} for Premium Autopay`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <AssistiveText
                        text={i18n.t(
                            'premiumAutopay.amount.missingAmountErrorSP'
                        )}
                        variant={AssistiveTextVariant.Error}
                    />
                );

                const expectedText =
                    config.translations.premiumAutopay.amount.missingAmountErrorSP.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display invalid amount error msg in ${languageName} for Premium Autopay`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <AssistiveText
                        text={i18n.t(
                            'premiumAutopay.amount.invalidAmountErrorSP'
                        )}
                        variant={AssistiveTextVariant.Error}
                    />
                );

                const expectedText =
                    config.translations.premiumAutopay.amount.invalidAmountErrorSP.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display missing amount error msg in ${languageName} for Loan Autopay`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <AssistiveText
                        text={i18n.t('loanAutopay.amount.missingAmountErrorSP')}
                        variant={AssistiveTextVariant.Error}
                    />
                );

                const expectedText =
                    config.translations.loanAutopay.amount.missingAmountErrorSP.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display invalid amount error msg in ${languageName} for Loan Autopay`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <AssistiveText
                        text={i18n.t('loanAutopay.amount.invalidAmountErrorSP')}
                        variant={AssistiveTextVariant.Error}
                    />
                );

                const expectedText =
                    config.translations.loanAutopay.amount.invalidAmountErrorSP.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
        });

        describe('with SYSTEMATIC_PROGRAMS_TABLE flag disabled ', () => {
            it(`should display missing amount error msg in ${languageName} for Premium Autopay`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <AssistiveText
                        text={i18n.t(
                            'premiumAutopay.amount.missingAmountError'
                        )}
                        variant={AssistiveTextVariant.Error}
                    />
                );

                const expectedText =
                    config.translations.premiumAutopay.amount.missingAmountError.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display invalid amount error msg in ${languageName} for Premium Autopay`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <AssistiveText
                        text={i18n.t(
                            'premiumAutopay.amount.invalidAmountError'
                        )}
                        variant={AssistiveTextVariant.Error}
                    />
                );

                const expectedText =
                    config.translations.premiumAutopay.amount.invalidAmountError.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display missing amount error msg in ${languageName} for Loan Autopay`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <AssistiveText
                        text={i18n.t('loanAutopay.amount.missingAmountError')}
                        variant={AssistiveTextVariant.Error}
                    />
                );

                const expectedText =
                    config.translations.loanAutopay.amount.missingAmountError.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
            it(`should display invalid amount error msg in ${languageName} for Loan Autopay`, async () => {
                await i18n.changeLanguage(languageCode);
                const { getByText } = render(
                    <AssistiveText
                        text={i18n.t('loanAutopay.amount.invalidAmountError')}
                        variant={AssistiveTextVariant.Error}
                    />
                );

                const expectedText =
                    config.translations.loanAutopay.amount.invalidAmountError.trim();

                expect(getByText(expectedText)).toBeInTheDocument();
            });
        });
    });
});
