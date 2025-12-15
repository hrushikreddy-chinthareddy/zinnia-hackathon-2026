import { DataGroup, DataNode, FieldType } from '../types';
import { makeField, makeGroup, makeSection } from '../utils';
import {
    findFieldInNode,
    findFieldInNodes,
    findInGroup,
    findInNode,
    findInNodes,
    findSectionInNode,
    findSectionInNodes,
    findValueInNode,
} from './traversal';

// Common test tree used across traversal tests
// rootNodes = [
//   0: field("id"),
//   1: section("person") with nested section("address"),
//   2: group of groups containing fields "a" and "b"
// ]

const buildTestTree = (): DataNode[] => {
    const idField = makeField('id', '123');

    const addressSection = makeSection('address', [
        makeField('city', 'Metropolis'),
        makeField('zip', '12345'),
    ]);

    const personSection = makeSection('person', [
        makeField('name', 'Alice'),
        addressSection,
    ]);

    const group = makeGroup([[makeField('a', '1')], [makeField('b', '2')]]);

    return [idField, personSection, group];
};

describe('findInNodes', () => {
    it('finds by numeric index at root', () => {
        const nodes = buildTestTree();

        const result = findInNodes({ nodes, key: '0' });

        expect(result).toEqual(makeField('id', '123'));
    });

    it('finds by label at root', () => {
        const nodes = buildTestTree();

        const result = findInNodes({ nodes, key: 'person' });

        expect(result).toMatchObject({
            type: FieldType.section,
            label: 'person',
        });
    });

    it('navigates nested path using dot notation', () => {
        const nodes = buildTestTree();

        const result = findInNodes({ nodes, key: 'person.address.city' });

        expect(result).toEqual(makeField('city', 'Metropolis'));
    });

    it('returns undefined for missing nodes', () => {
        const nodes = buildTestTree();

        expect(findInNodes({ nodes, key: 'unknown' })).toBeUndefined();
        expect(findInNodes({ nodes, key: 'person.unknown' })).toBeUndefined();
    });
});

describe('findInGroup', () => {
    it('uses numeric index into group-of-groups, with nested path', () => {
        const nodes = buildTestTree();
        const group = nodes[2] as DataGroup;

        const result = findInGroup({
            nodes: group.children,
            key: '1.b',
        });

        expect(result).toEqual(makeField('b', '2'));
    });

    it('searches inner groups by label when key is non-numeric', () => {
        const nodes = buildTestTree();
        const group = nodes[2] as DataGroup;

        const result = findInGroup({
            nodes: group.children,
            key: 'a',
        });

        expect(result).toEqual(makeField('a', '1'));
    });

    it('returns undefined when index is out of range', () => {
        const nodes = buildTestTree();
        const group = nodes[2] as DataGroup;

        const result = findInGroup({
            nodes: group.children,
            key: '5',
        });

        expect(result).toBeUndefined();
    });
});

describe('findInNode', () => {
    it('returns field node when label matches at root', () => {
        const nodes = buildTestTree();
        const root = nodes[0];

        const result = findInNode({ node: root, key: 'id' });

        expect(result).toEqual(makeField('id', '123'));
    });

    it('delegates to children when node is a section', () => {
        const nodes = buildTestTree();
        const person = nodes[1];

        const result = findInNode({ node: person, key: 'address.city' });

        expect(result).toEqual(makeField('city', 'Metropolis'));
    });

    it('delegates to group traversal when node is a group', () => {
        const nodes = buildTestTree();
        const group = nodes[2];

        const result = findInNode({ node: group, key: '0.a' });

        expect(result).toEqual(makeField('a', '1'));
    });

    it('returns undefined when node is undefined', () => {
        const result = findInNode({ node: undefined, key: 'anything' });

        expect(result).toBeUndefined();
    });
});

describe('section helpers', () => {
    it('findSectionInNode returns section when found', () => {
        const nodes = buildTestTree();
        const root = makeSection('root', nodes);

        const section = findSectionInNode({
            node: root,
            key: 'person.address',
        });

        expect(section).toMatchObject({
            type: FieldType.section,
            label: 'address',
        });
    });

    it('findSectionInNodes returns section from list', () => {
        const nodes = buildTestTree();

        const section = findSectionInNodes({ nodes, key: 'person.address' });

        expect(section).toMatchObject({
            type: FieldType.section,
            label: 'address',
        });
    });

    it('section helpers return undefined when not found', () => {
        const nodes = buildTestTree();

        expect(
            findSectionInNode({ node: nodes[0], key: 'missing' })
        ).toBeUndefined();
        expect(findSectionInNodes({ nodes, key: 'missing' })).toBeUndefined();
    });
});

describe('field helpers', () => {
    it('findFieldInNode returns field when found', () => {
        const nodes = buildTestTree();
        const root = makeSection('root', nodes);

        const field = findFieldInNode({ node: root, key: 'person.name' });

        expect(field).toEqual(makeField('name', 'Alice'));
    });

    it('findFieldInNodes returns field from list', () => {
        const nodes = buildTestTree();

        const field = findFieldInNodes({ nodes, key: 'person.name' });

        expect(field).toEqual(makeField('name', 'Alice'));
    });

    it('field helpers return undefined when not found', () => {
        const nodes = buildTestTree();

        expect(
            findFieldInNode({ node: nodes[1], key: 'missing' })
        ).toBeUndefined();
        expect(findFieldInNodes({ nodes, key: 'missing' })).toBeUndefined();
    });
});

describe('findValueInNode', () => {
    it('returns the value of a found field', () => {
        const nodes = buildTestTree();
        const root = makeSection('root', nodes);

        const value = findValueInNode({
            node: root,
            key: 'person.address.zip',
        });

        expect(value).toBe('12345');
    });

    it('returns undefined when no field is found', () => {
        const nodes = buildTestTree();
        const root = makeSection('root', nodes);

        const value = findValueInNode({
            node: root,
            key: 'person.address.missing',
        });

        expect(value).toBeUndefined();
    });
});
