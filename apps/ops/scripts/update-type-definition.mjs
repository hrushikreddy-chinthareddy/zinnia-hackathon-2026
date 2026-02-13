import * as fs from 'fs';

function resolveRefs(originalObj, obj, currentPath = '') {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (
        Object.prototype.hasOwnProperty.call(obj, '$ref') &&
        obj.$ref.includes('/properties/')
    ) {
        const refPath = obj['$ref'].replace('#/', '').split('/');
        const value = refPath.reduce((acc, key) => acc[key], originalObj);
        return resolveRefs(originalObj, value, currentPath);
    }

    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            obj[i] = resolveRefs(originalObj, obj[i], currentPath + '/' + i);
        }
        return obj;
    }

    const result = {};
    for (let key in obj) {
        result[key] = resolveRefs(
            originalObj,
            obj[key],
            currentPath + '/' + key
        );
    }
    return result;
}

// Process SOR spec
try {
    const data = fs.readFileSync('./api-types/specs/sor.json');
    const parsedData = JSON.parse(data);
    const spec = resolveRefs(parsedData, parsedData);
    fs.writeFileSync(
        './api-types/specs/sor.updated.json',
        JSON.stringify(spec, null, 2)
    );
    console.log('✅ SOR spec preprocessed successfully');
} catch (error) {
    console.error('❌ Failed to preprocess SOR spec:', error.message);
    throw error;
}

// Process Search spec - fix TaxWithHolding casing conflict
try {
    const searchData = fs.readFileSync('./api-types/specs/search.json');
    const searchSpec = JSON.parse(searchData);

    // Rename TaxWithHolding schema to avoid casing conflict with TaxWithholding
    if (searchSpec.components?.schemas?.TaxWithHolding) {
        searchSpec.components.schemas.PeopleTaxWithholding =
            searchSpec.components.schemas.TaxWithHolding;
        delete searchSpec.components.schemas.TaxWithHolding;
    }

    // Update all references from TaxWithHolding to PeopleTaxWithholding
    const specStr = JSON.stringify(searchSpec);
    const updatedSpecStr = specStr.replace(
        /#\/components\/schemas\/TaxWithHolding/g,
        '#/components/schemas/PeopleTaxWithholding'
    );

    fs.writeFileSync(
        './api-types/specs/search.updated.json',
        JSON.stringify(JSON.parse(updatedSpecStr), null, 2)
    );
    console.log('✅ Search spec preprocessed successfully');
} catch (error) {
    console.error('❌ Failed to preprocess Search spec:', error.message);
    throw error;
}
