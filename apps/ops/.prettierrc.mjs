// .prettierrc
/** @type {import("prettier").Config} */
import config from '@zinnia/prettier-config';

module.exports = {
    ...config,
    tailwindFunctions: ['clsx'],
};
