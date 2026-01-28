/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',

        // Or if using `src` directory:
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        screens: {
            xs: '320px',
            sm: '500px',
            md: '768px',
            mid: '996px',
            lg: '1025px',
            xl: '1440px',
            'welcome-xl': '1500px',
        },
        extend: {
            keyframes: {
                fadeIn: {
                    from: { opacity: 0 },
                    to: { opacity: 1 },
                },
                fadeOut: {
                    from: { opacity: 1 },
                    to: { opacity: 0 },
                },
            },
            animation: {
                fadeIn: 'fadeIn 300ms ease',
                fadeOut: 'fadeOut 300ms ease',
            },
            backgroundImage: {
                primary: 'rgb(var(--color-primary) / <alpha-value>)',
                lightest: 'rgb(var(--color-primary-lightest) / <alpha-value>)',
            },
            gridTemplateColumns: {
                'min-2': 'min-content min-content',
                'auto-2': 'auto auto',
                'min-4': 'min-content min-content min-content min-content',
                'auto-4': 'auto auto auto auto',
            },
            borderWidth: {
                1: '1px',
                3: '3px',
            },
            height: {
                32: '32px',
                19: '76px',
                21: '84px',
                22: '88px',
                92: '92px',
                124: '124px',
            },
            width: {
                8.5: '34px',
                46: '184px',
                47: '188px',
                54: '214px',
                85: '348px',
                92: '366px',
            },
            maxWidth: {
                140: '140px',
            },
            fontSize: {
                '3xs': [
                    'var(--measure-dimension-core-typography-font-size-font-size-3-x-small)',
                    'var(--measure-dimension-core-typography-font-size-line-height-3-x-small)',
                ],
                '2xs': [
                    'var(--measure-dimension-core-typography-font-size-font-size-2-x-small)',
                    'var(--measure-dimension-core-typography-font-size-line-height-2-x-small)',
                ],
                xs: [
                    'var(--measure-dimension-core-typography-font-size-font-size-x-small)',
                    'var(--measure-dimension-core-typography-font-size-line-height-x-small)',
                ],
                sm: [
                    'var(--measure-dimension-core-typography-font-size-font-size-small)',
                    'var(--measure-dimension-core-typography-font-size-line-height-small)',
                ],
                md: [
                    'var(--measure-dimension-core-typography-font-size-font-size-medium)',
                    'var(--measure-dimension-core-typography-font-size-line-height-medium)',
                ],
                base: [
                    'var(--measure-dimension-core-typography-font-size-font-size-medium)',
                    'var(--measure-dimension-core-typography-font-size-line-height-medium)',
                ],
                lg: [
                    'var(--measure-dimension-core-typography-font-size-font-size-large)',
                    'var(--measure-dimension-core-typography-font-size-line-height-large)',
                ],
                xl: [
                    'var(--measure-dimension-core-typography-font-size-font-size-x-large)',
                    'var(--measure-dimension-core-typography-font-size-line-height-x-large)',
                ],
                '2xl': [
                    'var(--measure-dimension-core-typography-font-size-font-size-2x-large)',
                    'var(--measure-dimension-core-typography-font-size-line-height-2x-large)',
                ],
                '3xl': [
                    'var(--measure-dimension-core-typography-font-size-font-size-3x-large)',
                    'var(--measure-dimension-core-typography-font-size-line-height-3x-large)',
                ],
                'hl-2': [
                    '26px',
                    {
                        lineHeight: '32px',
                        fontWeight: 500,
                    },
                ],
                'field-label':
                    'var(--measure-font-sizing-type-tokens-field-label-font-size)',
                'field-label-sm':
                    'var(--measure-font-sizing-type-tokens-field-label-sm-font-size)',
                'content-value':
                    'var(--measure-font-sizing-type-tokens-content-value-font-size)',
                'content-caption':
                    'var(--measure-font-sizing-type-tokens-content-caption-font-size)',
                'label-sm-alt':
                    'var(--measure-font-sizing-type-tokens-label-sm-alt-font-size)',
                'label-sm':
                    'var(--measure-font-sizing-type-tokens-label-sm-font-size)',
                'label-md':
                    'var(--measure-font-sizing-type-tokens-label-md-font-size)',
                'label-lg':
                    'var(--measure-font-sizing-type-tokens-label-lg-font-size)',
                'links-sm':
                    'var(--measure-font-sizing-type-tokens-nav-sm-font-size)',
                'body-sm':
                    'var(--measure-font-sizing-font-size-font-size-x-small)',
            },
            lineHeight: {
                4.5: '18px',
                5.5: '22px',
                6.5: '26px',
                h1: 'var(--line-height-line-height-type-tokens-headlines-desktop-h1-font-line-height)',
                h2: 'var(--line-height-line-height-type-tokens-headlines-desktop-h2-font-line-height)',
                h2acc: 'var(--line-height-line-height-type-tokens-headlines-desktop-h2-accent-font-line-height)',
                h3: 'var(--line-height-line-height-type-tokens-headlines-desktop-h3-font-line-height)',
                h4: 'var(--line-height-line-height-type-tokens-headlines-desktop-h4-font-line-height)',
            },
            rotate: {
                270: '270deg',
            },
            spacing: {
                0: 'var(--measure-dimension-z-space-none)',
                0.5: 'var(--measure-dimension-z-space-0)',
                1: 'var(--measure-dimension-z-space-1)',
                1.5: 'var(--measure-dimension-z-space-1-5)',
                2: 'var(--measure-dimension-z-space-2)',
                2.5: '10px',
                3: 'var(--measure-dimension-z-space-3)',
                3.5: '14px',
                4: 'var(--measure-dimension-z-space-4)',
                4.5: '18px',
                5: '20px',
                5.5: '22px',
                6: 'var(--measure-dimension-z-space-6)',
                6.5: '26px',
                7: '28px',
                7.5: '30px',
                8: 'var(--measure-dimension-z-space-8)',
                8.5: '34px',
                9: '36px',
                9.5: '38px',
                10: 'var(--measure-dimension-z-space-10)',
                10.5: '42px',
                11: '44px',
                11.5: '46px',
                12: 'var(--measure-dimension-z-space-12)',
                12.5: '50px',
                13: '52px',
                13.5: '54px',
                14: 'var(--measure-dimension-z-space-14)',
                14.5: '58px',
                15: '60px',
                15.5: '62px',
                16: 'var(--measure-dimension-z-space-16)',
                18: 'var(--measure-dimension-z-space-18)',
                20: 'var(--measure-dimension-z-space-20)',
                22: 'var(--measure-dimension-z-space-22)',
                24: 'var(--measure-dimension-z-space-24)',
                26: 'var(--measure-dimension-z-space-26)',
                28: 'var(--measure-dimension-z-space-28)',
                30: 'var(--measure-dimension-z-space-30)',
                32: 'var(--measure-dimension-z-space-32)',
                34: 'var(--measure-dimension-z-space-34)',
                36: 'var(--measure-dimension-z-space-36)',
                38: 'var(--measure-dimension-z-space-38)',
                40: 'var(--measure-dimension-z-space-40)',
                42: 'var(--measure-dimension-z-space-42)',
                sm: 'var(--measure-dimension-z-space-1)',
                md: 'var(--measure-dimension-z-space-2)',
                lg: 'var(--measure-dimension-z-space-3)',
                xl: 'var(--measure-dimension-z-space-4)',
                '2xl': 'var(--measure-dimension-z-space-6)',
                '3xl': 'var(--measure-dimension-z-space-8)',
            },
            fontFamily: {
                primary:
                    'var(--string-core-typography-font-family-font-family-primary)',
                secondary:
                    'var(--string-core-typography-font-family-font-family-secondary)',
                headings:
                    'var(--string-core-typography-font-family-font-family-headings)',
                subtitles:
                    'var(--string-core-typography-font-family-font-family-subtitles)',
                buttons:
                    'var(--string-core-typography-font-family-font-family-buttons)',
                body: 'var(--string-core-typography-font-family-font-family-body)',
                links: 'var(--string-core-typography-font-family-font-family-links)',
                navigation:
                    'var(--string-core-typography-font-family-font-family-navigation)',
            },
            colors: {
                primary: {
                    DEFAULT: 'var(--color-secondary-color-primary)',
                    light: 'var(--color-secondary-color-primary-light)',
                    lighter: 'var(--color-secondary-color-primary-lighter)',
                    lightest: 'var(--color-secondary-color-primary-lightest)',
                    dark: 'var(--color-secondary-color-primary-dark)',
                },
                secondary: {
                    DEFAULT: 'var(--color-secondary-color-secondary)',
                    light: 'var(--color-secondary-color-secondary-light)',
                    lighter: 'var(--color-secondary-color-secondary-lighter)',
                    lightest: 'var(--color-secondary-color-secondary-lightest)',
                    dark: 'var(--color-secondary-color-secondary-dark)',
                },
                accent1: 'var(--color-accent-color-accent-one)',
                accent2: 'var(--color-accent-color-accent-two)',
                background: 'var(--color-base-surface-tertiary)',
                gray: {
                    50: 'rgb(var(--color-50-gray) / <alpha-value>)',
                    100: 'rgb(var(--color-100-gray) / <alpha-value>)',
                    200: 'rgb(var(--color-200-gray) / <alpha-value>)',
                    300: 'rgb(var(--color-300-gray) / <alpha-value>)',
                    400: 'rgb(var(--color-400-gray) / <alpha-value>)',
                    500: 'rgb(var(--color-500-gray) / <alpha-value>)',
                    600: 'rgb(var(--color-600-gray) / <alpha-value>)',
                    700: 'rgb(var(--color-700-gray) / <alpha-value>)',
                    800: 'rgb(var(--color-800-gray) / <alpha-value>)',
                    900: 'rgb(var(--color-900-gray) / <alpha-value>)',
                    logo: 'rgb(var(--color-logo-gray) / <alpha-value>)',
                },
                fuchsia: {
                    400: 'rgb(var(--color-400-fuchsia) / <alpha-value>)',
                    600: 'rgb(var(--color-600-fuchsia) / <alpha-value>)',
                },
                yellow: {
                    300: 'rgb(var(--color-300-yellow) / <alpha-value>)',
                    400: 'rgb(var(--color-400-yellow) / <alpha-value>)',
                    800: 'rgb(var(--color-800-yellow) / <alpha-value>)',
                },
                red: {
                    400: 'rgb(var(--color-400-red) / <alpha-value>)',
                    600: 'rgb(var(--color-600-red) / <alpha-value>)',
                },
                aqua: {
                    400: 'rgb(var(--color-400-aqua) / <alpha-value>)',
                    800: 'rgb(var(--color-800-aqua) / <alpha-value>)',
                },
                orange: {
                    500: 'rgb(var(--color-500-orange) / <alpha-value>)',
                },
                cerulean: {
                    400: 'rgb(var(--color-400-cerulean) / <alpha-value>)',
                    600: 'rgb(var(--color-600-cerulean) / <alpha-value>)',
                },
                lime: {
                    300: 'rgb(var(--color-300-lime) / <alpha-value>)',
                    400: 'rgb(var(--color-400-lime) / <alpha-value>)',
                },
                semantic: {
                    info: {
                        DEFAULT:
                            'var(--color-semantics-color-semantic-information)',
                        light: 'var(--color-semantics-color-semantic-information-light)',
                    },
                    success: {
                        DEFAULT:
                            'var(--color-semantics-color-semantic-success)',
                        light: 'var(--color-semantics-color-semantic-success-light)',
                    },
                    pending: {
                        DEFAULT:
                            'var(--color-semantics-color-semantic-pending)',
                        light: 'var(--color-semantics-color-semantic-pending-light)',
                    },
                    warning: {
                        DEFAULT:
                            'var(--color-semantics-color-semantic-warning)',
                        light: 'var(--color-semantics-color-semantic-warning-light)',
                    },
                    error: {
                        DEFAULT: 'var(--color-semantics-color-semantic-error)',
                        light: 'var(--color-semantics-color-semantic-error-light)',
                    },
                    focus: 'var(--color-semantics-color-semantic-focus)',
                    highlight:
                        'var(--color-semantics-color-semantic-text-highlight)',
                },
                surface: {
                    primary: 'var(--color-base-surface-primary)',
                    secondary: 'var(--color-base-surface-secondary)',
                    tertiary: 'var(--color-base-surface-tertiary)',
                    quaternary: 'var(--color-base-surface-quaternary)',
                    bold: 'var(--color-base-surface-bold)',
                    dark: 'var(--color-base-surface-dark)',
                    darker: 'var(--color-base-surface-darker)',
                    textHighlight: 'var(--color-base-surface-text-highlight)',
                },
                border: {
                    light: 'var(--color-base-border-light)',
                    selected: 'var(--color-base-border-selected-border)',
                    hover: 'var(--color-states-hover-border-hover-border)',
                    subtle: 'var(--color-base-border-subtle)',
                },
                link: 'var(--color-base-icon-action-text-link)',
            },
            boxShadow: {
                xs: 'var(--shadow-elevation-light-xs)',
                sm: 'var(--shadow-elevation-light-sm)',
                md: 'var(--shadow-elevation-light-md)',
                lg: 'var(--shadow-elevation-light-lg)',
                xl: 'var(--shadow-elevation-light-xl)',
                '2xl': 'var(--shadow-elevation-light-2xl)',
                'xs-dark': 'var(--shadow-elevation-dark-xs)',
                'sm-dark': 'var(--shadow-elevation-dark-sm)',
                'md-dark': 'var(--shadow-elevation-dark-md)',
                'lg-dark': 'var(--shadow-elevation-dark-lg)',
                'xl-dark': 'var(--shadow-elevation-dark-xl)',
                '2xl-dark': 'var(--shadow-elevation-dark-2xl)',
                'elevation-light-04': 'var(--shadow-elevation-light-sm)',
                'elevation-light-08': 'var(--shadow-elevation-light-md)',
                'elevation-light-16': 'var(--shadow-elevation-light-lg)',
                'elevation-light-32': 'var(--shadow-elevation-light-2xl)',
                'elevation-04': 'var(--shadow-elevation-dark-sm)',
                'elevation-dark-08': 'var(--shadow-elevation-dark-md)',
            },
            transitionProperty: {
                height: 'height',
                padding: 'padding',
                width: 'width',
            },
        },
        translate: {
            216: '216px',
        },
        transitionDelay: {
            600: '600ms',
        },
        typography: (theme) => ({
            DEFAULT: {
                css: {
                    code: {
                        backgroundColor: 'black',
                        fontWeight: theme('fontWeight.medium'),
                        fontVariantLigatures: 'none',
                    },
                    pre: {
                        background: theme('colors.black'),
                        color: theme('colors.slate.50'),
                        borderRadius: theme('borderRadius.xl'),
                        padding: theme('padding.5'),
                        boxShadow: theme('boxShadow.md'),
                        display: 'flex',
                        marginTop: `${20 / 14}em`,
                        marginBottom: `${32 / 14}em`,
                    },
                    h1: {
                        font: 'var(--typography-desktop-headline-1-d)',
                    },
                    h2: {
                        font: 'var(--typography-desktop-headline-2-d)',
                    },
                    h2acc: {
                        font: 'var(--typography-desktop-headline-2-accent-d)',
                    },
                    h3: {
                        font: 'var(--typography-desktop-headline-3-d)',
                    },
                    h4: {
                        font: 'var(--typography-desktop-headline-4-d)',
                    },
                },
            },
        }),
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/forms'),
    ],
};
