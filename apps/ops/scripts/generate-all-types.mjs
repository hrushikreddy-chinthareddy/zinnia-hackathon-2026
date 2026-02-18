#!/usr/bin/env node

import { createClient } from '@hey-api/openapi-ts';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const specsDir = path.resolve(__dirname, '../api-types/specs');
const generatedTypesDir = path.resolve(
    __dirname,
    '../api-types/generated-types'
);

async function findSpecFiles() {
    let files;
    try {
        files = await fs.readdir(specsDir);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`❌ Specs directory not found: ${specsDir}`);
            console.error(
                '   Please create a "specs" folder and add your API spec files there.'
            );
            process.exit(1);
        }
        throw error;
    }

    const specFiles = files.filter(
        (file) =>
            (file.endsWith('.yaml') || file.endsWith('.json')) &&
            !file.endsWith('.updated.json')
    );

    return specFiles.map((file) => {
        // Extract service name from filename (without extension)
        // documents.yaml -> documents
        // documents-v3.yaml -> documents-v3
        // sor.updated.json -> sor
        const name = file.replace(/\.(yaml|json)$/, '').replace('.updated', '');

        // Use preprocessed version if it exists
        let specPath = path.join(specsDir, file);
        const updatedFile = file
            .replace('.json', '.updated.json')
            .replace('.yaml', '.updated.yaml');
        const updatedPath = path.join(specsDir, updatedFile);

        if (existsSync(updatedPath)) {
            specPath = updatedPath;
        }

        return {
            name,
            file,
            path: specPath,
        };
    });
}

async function generateTypes() {
    const startTime = performance.now();
    console.log('🔍 Discovering API spec files...\n');

    const specs = await findSpecFiles();

    if (specs.length === 0) {
        console.log('⚠️  No API spec files found');
        return;
    }

    console.log(
        `Found ${specs.length} spec file${specs.length === 1 ? '' : 's'}:`
    );
    specs.forEach((spec) => console.log(`  - ${spec.name} (${spec.file})`));
    console.log('');

    // Clean generated types directory
    console.log('🧹 Cleaning generated types directory...');
    try {
        await fs.rm(generatedTypesDir, { recursive: true, force: true });
    } catch (error) {
        // Directory might not exist, that's fine
    }
    console.log('');

    // Generate types for each spec SEQUENTIALLY to avoid race conditions
    console.log('⚙️  Generating types sequentially...\n');

    for (const spec of specs) {
        const outputDir = path.join(generatedTypesDir, spec.name);
        console.log(`  Generating types for ${spec.name}...`);

        try {
            // Using @hey-api/openapi-ts programmatic API with parser transforms to extract inline enums
            await createClient({
                input: spec.path,
                output: {
                    path: outputDir,
                    tsConfigPath: 'off',
                },
                plugins: [
                    {
                        name: '@hey-api/typescript',
                        // Generate TypeScript enums instead of union types
                        enums: 'typescript',
                    },
                ],
                parser: {
                    transforms: {
                        // Extract inline enums to root level with custom naming
                        // TODO: hey-api currently only passes the direct parent name as the enum name; we should request the full breadcrumb as a feature
                        enums: {
                            mode: 'root',
                            name: (name) => `${name}Enum`,
                            case: 'PascalCase',
                        },
                    },
                    filters: {
                        operations: {
                            // Path definitions do not affect TS code generation, but can potentially mess up enum names.
                            // Note that currently including an empty array (incorrectly) ignores this override.
                            // Passing an empty string essentially tells the filter to ignore all operations.
                            include: [''],
                        },
                    },
                    patch: {
                        schemas: {
                            // TODO:
                            // preferredCommunicationType inside CommunicationPreferenceChange is a different enum from
                            // preferredCommunicationType inside Party; this patches the collision by renaming one of the enums,
                            // but we should agree with the API teams that no two enums should have the same name, unless
                            // they share the exact same values (at which point the enum should be defined at the root level).
                            CommunicationPreferenceChange: (schema) => {
                                schema.properties.communicationPreference.properties.CommunicationPreferenceChangePreferredCommunicationType =
                                    schema.properties.communicationPreference.properties.preferredCommunicationType;
                                delete schema.properties.communicationPreference
                                    .properties.preferredCommunicationType;
                            },
                        },
                    },
                },
            });
        } catch (error) {
            console.error(`  ❌ Failed to generate types for ${spec.name}`);
            if (error.message) {
                console.error(error.message);
            }
            throw error;
        }
    }

    console.log('\n✅ All types generated successfully!');

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`\n⏱️  Total generation time: ${duration}s`);
}

generateTypes().catch((error) => {
    console.error('\n❌ Type generation failed:', error.message);
    process.exit(1);
});
