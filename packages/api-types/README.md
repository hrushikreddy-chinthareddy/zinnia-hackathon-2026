# Source for spec files

https://github.com/zinnia/api-specs

# Adding new types

1. add yaml or json file to `/src` folder
2. add folder path to `/tsup.config.ts` file for folder dist generation
3. in `package.json`
   - add command for individual type generation
   - add command to `generate-types:all` command
   - add to `exports` object
   - add to `typesVersions` object
4. Run `pnpm run build` in api-specs root
