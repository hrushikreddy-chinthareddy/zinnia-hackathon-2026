# Source for spec files

https://github.com/zinnia/api-types

# Adding new types

1. add yaml or json file to `/src` folder
2. add folder path to `/tsup.config.ts` file for folder dist generation
3. in `package.json`
   - add command for individual type generation
   - add command to `generate-types:all` command
   - add to `exports` object
   - add to `typesVersions` object
4. Run `pnpm run build` in api-types root

# Updating Types

Not the SOR Spec: Paste the new json or yaml file into the existing and run `pnpm run build` in api-types root
SOR Spec: Grab a json version of the spec (or convert a yaml version into JSON), paste it into api-spec-sor.json, then run `pnpm run build` in api-types root (there's a magic step for the api-spec-sor.json in particular that runs to update type definitions)
