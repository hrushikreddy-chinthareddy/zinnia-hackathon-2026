import { Product, ProductType } from '@zinnia/api-types/types/sor';

import { DataGroup, DataNode, DataSection, FieldType } from '../types';
import {
    excludeNodeByCarrierRules,
    excludeNodesByLabel,
    searchNodes,
} from './node-visibility';
import { buildSearchTree, makeField, makeGroup, makeSection } from '../utils';

jest.mock('../translations/exclude-fields', () => ({
    excludeFields: new Set(['hiddenField', 'hiddenSection']),
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

        expect(excludeNodesByLabel({ node: visibleField })).toEqual(
            visibleField
        );
        expect(excludeNodesByLabel({ node: hiddenField })).toBeUndefined();
    });

    it('excludes sections whose label is in excludeFields set', () => {
        const visibleSection = makeSection('visibleSection', []);
        const hiddenSection = makeSection('hiddenSection', []);

        expect(excludeNodesByLabel({ node: visibleSection })).toEqual(
            visibleSection
        );
        expect(excludeNodesByLabel({ node: hiddenSection })).toBeUndefined();
    });

    it('does not exclude group nodes', () => {
        const group = makeGroup([[makeField('hiddenField', '1')]]);

        expect(excludeNodesByLabel({ node: group })).toEqual(group);
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
