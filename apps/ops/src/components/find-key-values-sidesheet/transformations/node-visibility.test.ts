import { Product, ProductType } from '@zinnia/api-types/types/sor';

import { DataGroup, DataNode, DataSection, FieldType } from '../types';
import {
    excludeNodeByCarrierRules,
    excludeNodeByLabel,
    searchNodes,
} from './node-visibility';
import { buildSearchTree, makeField, makeGroup, makeSection } from '../utils';

jest.mock('../translations/exclude-fields', () => ({
    excludeFieldsConfig: {
        default: new Set(['hiddenField', 'hiddenSection']),
        funds: new Set(['investmentType', 'modelName', 'modelId']),
    },
    getExcludeFields: (useCase: string = 'default') => {
        const config: Record<string, Set<string>> = {
            default: new Set(['hiddenField', 'hiddenSection']),
            funds: new Set(['investmentType', 'modelName', 'modelId']),
        };
        return config[useCase] ?? config.default;
    },
}));

jest.mock('../translations/carrier-rules', () => ({
    sectionVisibility: {
        lifeOnly: new Set(['LIFE']),
        productOnly: new Set(['TERM']),
        planOnly: new Set(['PLAN123']),
    },
}));

describe('excludeNodesByLabel', () => {
    it('excludes fields whose label is in excludeFields set', () => {
        const visibleField = makeField('visibleField', '1');
        const hiddenField = makeField('hiddenField', '2');

        expect(excludeNodeByLabel({ node: visibleField })).toEqual(
            visibleField
        );
        expect(excludeNodeByLabel({ node: hiddenField })).toBeUndefined();
    });

    it('excludes sections whose label is in excludeFields set', () => {
        const visibleSection = makeSection('visibleSection', []);
        const hiddenSection = makeSection('hiddenSection', []);

        expect(excludeNodeByLabel({ node: visibleSection })).toEqual(
            visibleSection
        );
        expect(excludeNodeByLabel({ node: hiddenSection })).toBeUndefined();
    });

    it('does not exclude group nodes', () => {
        const group = makeGroup([[makeField('hiddenField', '1')]]);

        expect(excludeNodeByLabel({ node: group })).toEqual(group);
    });

    it('uses default useCase when not specified', () => {
        const hiddenField = makeField('hiddenField', '1');
        const visibleField = makeField('visibleField', '2');

        expect(excludeNodeByLabel({ node: hiddenField })).toBeUndefined();
        expect(excludeNodeByLabel({ node: visibleField })).toEqual(
            visibleField
        );
    });

    it('excludes fields based on funds useCase, but not default useCase', () => {
        const investmentTypeField = makeField('investmentType', 'FIXED');
        const modelNameField = makeField('modelName', 'Test Model');
        const fundNameField = makeField('fundName', 'Test Fund');
        const notHiddenSection = makeSection('hiddenSection', []);

        expect(
            excludeNodeByLabel({ node: investmentTypeField, useCase: 'funds' })
        ).toBeUndefined();
        expect(
            excludeNodeByLabel({ node: modelNameField, useCase: 'funds' })
        ).toBeUndefined();
        expect(
            excludeNodeByLabel({ node: fundNameField, useCase: 'funds' })
        ).toEqual(fundNameField);
        expect(
            excludeNodeByLabel({ node: notHiddenSection, useCase: 'funds' })
        ).toEqual(notHiddenSection);
    });

    it('does not exclude funds-specific fields when using default useCase', () => {
        const investmentTypeField = makeField('investmentType', 'FIXED');

        expect(
            excludeNodeByLabel({
                node: investmentTypeField,
                useCase: 'default',
            })
        ).toEqual(investmentTypeField);
    });
});

describe('excludeNodeByCarrierRules', () => {
    const LOB_LIFE = Product.lineOfBusiness.LIFE;
    const PROD_TERM = ProductType.TERM;

    it('returns node unchanged when node is not a field or section', () => {
        const group = makeGroup([]);

        const result = excludeNodeByCarrierRules({
            node: group,
        });

        expect(result).toBe(group);
    });

    it('returns node when there is no visibility rule for its label', () => {
        const field = makeField('noRuleLabel', '1');

        const result = excludeNodeByCarrierRules({
            node: field,
            lineOfBusiness: LOB_LIFE,
            productType: PROD_TERM,
            planCode: 'PLAN123',
        });

        expect(result).toBe(field);
    });

    it('excludes node when rule exists but no matching context provided', () => {
        const section = makeSection('lifeOnly', []);

        const result = excludeNodeByCarrierRules({
            node: section,
        });

        expect(result).toBeUndefined();
    });

    it('includes node when lineOfBusiness matches rule', () => {
        const section = makeSection('lifeOnly', []);

        const result = excludeNodeByCarrierRules({
            node: section,
            lineOfBusiness: LOB_LIFE,
        });

        expect(result).toBe(section);
    });

    it('includes node when productType matches rule', () => {
        const section = makeSection('productOnly', []);

        const result = excludeNodeByCarrierRules({
            node: section,
            productType: PROD_TERM,
        });

        expect(result).toBe(section);
    });

    it('includes node when planCode matches rule', () => {
        const section = makeSection('planOnly', []);

        const result = excludeNodeByCarrierRules({
            node: section,
            planCode: 'PLAN123',
        });

        expect(result).toBe(section);
    });
});

describe('searchNodes', () => {
    it('filters fields by search string on label or value', () => {
        const nodes = buildSearchTree();
        const result = searchNodes(nodes, 'ali');
        const nameField = makeField('name', 'Alice');
        // "name" field with value "Alice" should be kept in both section and group
        expect(result).toHaveLength(2);

        const personSection = result[0] as DataSection;
        expect(personSection.type).toBe(FieldType.section);
        expect(personSection.children).toHaveLength(1);
        expect(personSection.children[0]).toEqual(nameField);

        const group = result[1] as DataGroup;
        expect(group.type).toBe(FieldType.group);
        // only arrays with at least one matching field should remain
        expect(group.children).toHaveLength(1);
        expect(group.children[0][0]).toEqual(nameField);
    });

    it('removes sections and groups that end up empty after filtering', () => {
        const nameField = makeField('name', 'Alice');
        const section = makeSection('person', [nameField]);
        const group = makeGroup([[nameField]]);

        const nodes: DataNode[] = [section, group];

        const result = searchNodes(nodes, 'zzz');

        expect(result).toEqual([]);
    });
});
