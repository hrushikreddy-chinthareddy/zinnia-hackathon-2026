import i18n from "./i18next";
import '@zinnia/bloom/css';

export const parameters = {
    i18n,
    locale: 'en',
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
};
