# API Types

This directory contains OpenAPI specifications and generated TypeScript types for the Consumer Experience application.

## Directory Structure

```
api-types/
├── specs/              # OpenAPI specification files (YAML/JSON)
├── generated-types/    # Auto-generated TypeScript types (gitignored)
└── README.md          # This file
```

## Usage

### Importing Types

Types are imported using the `@zinnia/api-types` alias to maintain compatibility with the monorepo structure:

```typescript
import type { PolicyDetail } from '@zinnia/api-types/types/pom';
import type { Document } from '@zinnia/api-types/types/documents';
```

This alias is configured in `tsconfig.json` and points to the local `api-types/generated-types` directory.

### Available Scripts

- **`pnpm run build-api-types`** - Full build: preprocess specs and generate all types
- **`pnpm run update-api-spec`** - Preprocess spec files (SOR and Search)
- **`pnpm run generate-api-types`** - Generate TypeScript types from specs
- **`pnpm run clean-api-types`** - Remove generated types

**Note:** API types are automatically generated as part of the `build` script.

### Generating Types

To regenerate types after updating spec files:

```bash
pnpm run build-api-types
```

This will:

1. Preprocess SOR and Search specs to resolve references
2. Generate TypeScript types for all 18 API specs
3. Output types to `api-types/generated-types/`

### Build Integration

API types are automatically generated when needed:

**Development:**

```bash
pnpm run dev  # Checks if types exist, generates if missing → starts dev server
```

**Production Build:**

```bash
pnpm run build  # Always generates fresh types → builds application
```

This means:

- **First run**: Types are generated automatically (~10-11 seconds)
- **Subsequent runs**: Types are skipped if they already exist (instant start)
- **Production builds**: Always get fresh types to ensure consistency
- **CI/CD pipelines**: No separate type generation steps needed

## Available API Specs

The following API specifications are available:

- `aggregation` - Aggregation service
- `analytics` - Analytics service
- `bpm` - Business Process Management
- `case` - Case management
- `case-v2` - Case management v2
- `contact-management` - Contact management
- `correspondence` - Correspondence service
- `documents` - Documents service
- `documents-v3` - Documents service v3
- `funds` - Funds service
- `knowledgebase` - Knowledge base
- `partyreference` - Party reference
- `policy-reference` - Policy reference
- `pom` - Policy Object Model
- `preferences` - User preferences
- `search` - Search service
- `sor` - System of Record
- `transaction-store` - Transaction store

## Technical Details

### Type Generation

Types are generated using `openapi-typescript-codegen@0.26.0`. The generation process runs **sequentially** (not in parallel) to avoid race condition bugs in the tool that can cause `ENOENT` errors.

### Spec Preprocessing

Some specs require preprocessing before type generation:

- **SOR spec**: Resolves internal `$ref` references
- **Search spec**: Renames `TaxWithHolding` to `PeopleTaxWithholding` to avoid casing conflicts

Preprocessed specs are saved as `*.updated.json` files and are gitignored.

## Migration Notes

This setup was migrated from `packages/api-types` to prepare for Consumer Experience becoming a standalone repository. The `@zinnia/api-types` import alias is maintained for easy migration - when the repo is split, existing imports will continue to work without changes.

## Maintenance

When adding new API specs:

1. Add the spec file (YAML or JSON) to `api-types/specs/`
2. Run `pnpm run build-api-types` to generate types
3. Import types using `@zinnia/api-types/types/{spec-name}`

The type generation is automatic and requires no manual configuration.
