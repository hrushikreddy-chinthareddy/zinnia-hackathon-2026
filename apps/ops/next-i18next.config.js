const path = require('path');

module.exports = {
    debug: false,
    i18n: {
        // Locales supported
        locales: ['en', 'fr', 'es'],
        defaultLocale: 'en',
    },
    localePath: path.resolve('./public/locales'),
    translation: {
        returnNull: false,
    },
    reloadOnPrerender: process.env.NODE_ENV === 'development',
};
