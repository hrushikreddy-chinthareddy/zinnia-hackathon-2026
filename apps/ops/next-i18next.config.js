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
    serializeConfig: false,
    interpolation: {
        escapeValue: false,
        format: (value, format, lng) => {
            switch(format) {
                case 'capitalize':
                    const str = String(value);
                    return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();
                default:
                    return value;
            }
        },
    },
    reloadOnPrerender: process.env.NODE_ENV === 'development',
};
