# @zinnia/api-types

TypeScript types generated from OpenAPI specifications.

## Source for spec files

https://github.com/zinnia/api-types

## Adding a new API spec

1. Drop your spec file in `src/specs/`:
   - `service-name.yaml` or `service-name.json`
   - No prefix required—just use the service name

2. Run the build:
   ```bash
   pnpm build
   ```

3. Done! Types are automatically:
   - Generated to `src/generated-types/service-name/`
   - Exported as `@zinnia/api-types/types/service-name`
   - Added to package exports

### Examples

```
src/specs/
├── documents.yaml          → @zinnia/api-types/types/documents
├── documents-v3.yaml       → @zinnia/api-types/types/documents-v3
├── sor.updated.json        → @zinnia/api-types/types/sor
└── your-new-service.yaml   → @zinnia/api-types/types/your-new-service
```

### File naming

- Use kebab-case: `my-service.yaml`
- Version suffixes work: `my-service-v2.yaml`
- `.updated.json` suffix is stripped automatically
- Supported formats: `.yaml`, `.json`

## Updating existing types

### For most specs
Paste the new JSON or YAML file into `src/specs/` (replacing the existing file) and run:
```bash
pnpm build
```

### For SOR spec (special case)
The SOR spec has a preprocessing step that updates type definitions:

1. Grab a JSON version of the spec (or convert YAML to JSON)
2. Paste it into `src/specs/sor.updated.json`
3. Run `pnpm build` (the `update-spec` script will run automatically)

## Usage in code

```typescript
import type { SomeType } from '@zinnia/api-types/types/your-service';
import type { Document } from '@zinnia/api-types/types/documents';
```

## Development

- **Generate types** (also updates exports): `pnpm generate-types`
- **Full build**: `pnpm build`
