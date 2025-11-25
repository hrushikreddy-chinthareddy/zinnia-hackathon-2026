/** @type {import("prettier").Config} */
export default {
    semi: true, // Specify if you want to print semicolons at the end of statements
    singleQuote: true, // If you want to use single quotes
    arrowParens: 'avoid', // Include parenthesis around a sole arrow function parameter,
    printWidth: 80,
    tabWidth: 2,
    trailingComma: 'es5',
    bracketSpacing: true,
    tailwindFunctions: ['clsx'],
};
