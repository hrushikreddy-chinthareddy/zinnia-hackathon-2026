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
                xs: ['10px, 22px'],
                sm: ['12px', '22px'],
                md: ['14px', '26px'],
                base: ['16px', '24px'],
                lg: ['20px', '24px'],
                xl: ['22px', '30px'],
                '2xl': ['24px', '30px'],
                '3xl': ['32px', '44px'],
                'hl-2': [
                    '26px',
                    {
                        lineHeight: '32px',
                        fontWeight: 500,
                    },
                ],
                'field-label': ['12px', '18px'],
                'content-value': [
                    '22px',
                    {
                        lineHeight: '24px',
                        fontWeight: 500,
                    },
                ],
                'content-caption': [
                    '12px',
                    {
                        lineHeight: '16px',
                    },
                ],
                'label-lg': ['16px', '24px'],
                'label-sm-alt': ['12px', '18px'],
                'links-sm': ['14px', '21px'],
                'body-sm': [
                    '14px',
                    {
                        lineHeight: '22px',
                        fontWeight: 400,
                    },
                ],
            },
            lineHeight: {
                4.5: '18px',
                5.5: '22px',
                6.5: '26px',
            },
            rotate: {
                270: '270deg',
            },
            spacing: {
                0.5: '2px',
                1: '4px',
                1.5: '6px',
                2: '8px',
                2.5: '10px',
                3: '12px',
                3.5: '14px',
                4: '16px',
                4.5: '18px',
                5: '20px',
                5.5: '22px',
                6: '24px',
                6.5: '26px',
                7: '28px',
                7.5: '30px',
                8: '32px',
                8.5: '34px',
                9: '36px',
                9.5: '38px',
                10: '40px',
                10.5: '42px',
                11: '44px',
                11.5: '46px',
                12: '48px',
                12.5: '50px',
                13: '52px',
                13.5: '54px',
                14: '56px',
                14.5: '58px',
                15: '60px',
                15.5: '62px',
                16: '64px',
                sm: '4px',
                md: '8px',
                lg: '12px',
                xl: '16px',
                '2xl': '24px',
                '3xl': '32px'
            },
            fontFamily: {
                primary: 'var(--font-family-primary)',
                secondary: 'var(--font-family-secondary)',
            },
            colors: {
                primary: {
                    DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
                    light: 'rgb(var(--color-primary-light) / <alpha-value>)',
                    lighter: 'rgb(var(--color-primary-lighter) / <alpha-value>)',
                    lightest: 'rgb(var(--color-primary-lightest) / <alpha-value>)',
                },
                secondary: {
                    DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
                    light: 'rgb(var(--color-secondary-light) / <alpha-value>)',
                    lighter: 'rgb(var(--color-secondary-lighter) / <alpha-value>)',
                    lightest: 'rgb(var(--color-secondary-lightest) / <alpha-value>)',
                    dark: 'rgb(var(--color-secondary-dark) / <alpha-value>)',
                },
                accent1: 'rgb(var(--color-accent-one) / <alpha-value>)',
                accent2: 'rgb(var(--color-accent-two) / <alpha-value>)',
                background: 'rgb(237, 237, 237)',
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
                        DEFAULT: 'rgb(var(--color-semantic-information) / <alpha-value>)',
                        light: 'rgb(var(--color-semantic-information-light) / <alpha-value>)',
                    },
                    success: {
                        DEFAULT: 'rgb(var(--color-semantic-success) / <alpha-value>)',
                        light: 'rgb(var(--color-semantic-success-light) / <alpha-value>)',
                    },
                    pending: {
                        DEFAULT: 'rgb(var(--color-semantic-pending) / <alpha-value>)',
                        light: 'rgb(var(--color-semantic-pending-light) / <alpha-value>)',
                    },
                    warning: {
                        DEFAULT: 'rgb(var(--color-semantic-warning) / <alpha-value>)',
                        light: 'rgb(var(--color-semantic-warning-light) / <alpha-value>)',
                    },
                    error: {
                        DEFAULT: 'rgb(var(--color-semantic-error) / <alpha-value>)',
                        light: 'rgb(var(--color-semantic-error-light) / <alpha-value>)',
                    },
                    focus: 'rgb(var(--color-semantic-focus) / <alpha-value>)',
                    highlight: 'rgb(var(--color-semantic-highlight) / <alpha-value>)',
                },
                surface: {
                    dark: 'var(--color-base-surface-surface-dark)',
                    tertiary: 'var(--color-base-surface-surface-tertiary)'
                },
                border: {
                    light: 'var(--color-base-border-border-light)',
                    selected: 'var(--color-base-border-selected-border)',
                    hover: 'var(--color-states-hover-border-hover-border)'
                },
            },
            boxShadow: {
                sm: '0 0.3px 0.9px rgba(0, 0, 0, 0.07), 0 1.6px 3.6px rgba(0, 0, 0, 0.11)',
                'elevation-light-04':
                    '0 1.600000023841858px 3.5999999046325684px 0 rgba(0, 0, 0, 0.11), 0 0.30000001192092896px 0.8999999761581421px 0 rgba(0, 0, 0, 0.07)',
                'elevation-light-08':
                    '0 3.200000047683716px 7.199999809265137px 0 rgba(0, 0, 0, 0.13), 0 0.6000000238418579px 1.7999999523162842px 0 rgba(0, 0, 0, 0.11)',
                'elevation-light-16':
                    '0 6.400000095367432px 14.399999618530273px 0 rgba(0, 0, 0, 0.13), 0 1.2000000476837158px 3.5999999046325684px 0 rgba(0, 0, 0, 0.11)',
                'elevation-light-32':
                    '0 12.800000190734863px 28.799999237060547px 0 rgba(0, 0, 0, 0.22), 0 2.4000000953674316px 7.400000095367432px 0 rgba(0, 0, 0, 0.18',
                'elevation-04': '0px 0.3px 0.9px rgba(0, 0, 0, 0.07), 0px 1.6px 3.6px rgba(0, 0, 0, 0.11)',
                'elevation-dark-08': '0px 4px 8px rgba(0, 0, 0, 0.28), 0px 0px 2px rgba(0, 0, 0, 0.2);',
            },
            transitionProperty: {
                height: 'height',
                padding: 'padding',
                width: 'width',
            },
        },
        variants: {
            extend: {
                display: ['group-hover'],
            },
        },
        translate: {
            216: '216px',
        },
        transitionDelay: {
            600: '600ms',
        },
        typography: theme => ({
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
                    h2: {
                        fontSize: '24px',
                        textDecoration: 'none',
                        fontWeight: '300',
                        letterSpacing: 0,
                        lineHeight: '30px',
                        textTransform: 'none',
                        fontFamily: theme('fontFamily.primary'),
                    },
                    h2acc: {
                        fontSize: '24px',
                        textDecoration: 'none',
                        fontWeight: '700',
                        letterSpacing: 0,
                        lineHeight: '30px',
                        textTransform: 'none',
                        fontFamily: theme('fontFamily.primary'),
                    },
                    h3: {
                        fontSize: '22px',
                        textDecoration: 'none',
                        fontWeight: '500',
                        letterSpacing: 0,
                        lineHeight: '30px',
                        textTransform: 'none',
                        fontFamily: theme('fontFamily.primary'),
                    },
                    h4: {
                        fontSize: '18px',
                        textDecoration: 'none',
                        fontWeight: '400',
                        letterSpacing: 0,
                        lineHeight: '30px',
                        textTransform: 'none',
                        fontFamily: theme('fontFamily.primary'),
                    },
                },
            },
        }),
    },
    plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
