This package is currently not used but we want to keep the code around.

IF this package is needed in the future, add the following scripts back to the package.json:

"scripts": {
"dev": "vite",
"build": "tsc -b && vite build",
"lint": "eslint .",
"preview": "vite preview",
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build",
"chromatic": "npx chromatic --exit-zero-on-changes"
},

and remove the .turboignore file
