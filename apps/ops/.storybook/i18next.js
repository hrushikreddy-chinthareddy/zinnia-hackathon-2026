import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';

const ns = ['common', 'colDefs'];
const supportedLngs = ['en', 'fr', 'es'];
const resources = ns.reduce((acc, n) => {
    supportedLngs.forEach(lng => {
        if (!acc[lng]) acc[lng] = {};
        acc[lng] = {
            ...acc[lng],
            [n]: require(`../public/locales/${lng}/${n}.json`),
        };
    });
    return acc;
}, {});

i18n.use(initReactI18next).init({
    //debug: true,
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    ns,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    supportedLngs,
    resources,
    returnNull: false,
});

export default i18n;
