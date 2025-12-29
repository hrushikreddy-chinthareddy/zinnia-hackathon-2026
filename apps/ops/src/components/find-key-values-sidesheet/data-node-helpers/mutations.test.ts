import { TFunction } from 'next-i18next';

import {
    FieldType,
    DataNode,
    DataField,
    DataSection,
    DataGroup,
    TransformFunction,
} from '../types';
import {
    applyTransformationsToNodes,
    convertTuple,
    buildRenderTreeFromSourceData,
    transformNode,
    transformNodes,
} from './mutations';

jest.mock('../transformations/formatters', () => ({
    formatAsDataValue: ({ fieldData }: { fieldData: unknown }) =>
        String(fieldData),
}));

jest.mock('../translations/subsection-field-to-title', () => ({
    sectionTypeToSubSectionTitleFields: {
        addresses: 'line1',
    },
}));

const t: TFunction = ((key: string) => key) as unknown as TFunction;

describe('renderTreeFromSourceData', () => {
    it('returns empty array for non-object input', () => {
        expect(buildRenderTreeFromSourceData(null, t)).toEqual([]);
        expect(buildRenderTreeFromSourceData(undefined, t)).toEqual([]);
        expect(buildRenderTreeFromSourceData('string', t)).toEqual([]);
        expect(buildRenderTreeFromSourceData(123, t)).toEqual([]);
    });

    it('converts a flat object with primitive values to field nodes', () => {
        const result = buildRenderTreeFromSourceData({ a: 1, b: 'two' }, t);

        expect(result).toEqual([
            { type: FieldType.field, label: 'a', value: '1' },
            { type: FieldType.field, label: 'b', value: 'two' },
        ]);
    });

    it('skips nullish and empty string values', () => {
        const result = buildRenderTreeFromSourceData(
            { a: null, b: '', c: 0 },
            t
        );

        expect(result).toEqual([
            { type: FieldType.field, label: 'c', value: '0' },
        ]);
    });

    it('wraps nested objects as section nodes', () => {
        const source = {
            section: {
                foo: 'bar',
            },
        };

        const result = buildRenderTreeFromSourceData(source, t);

        expect(result).toEqual([
            {
                type: FieldType.section,
                label: 'section',
                children: [
                    {
                        type: FieldType.field,
                        label: 'foo',
                        value: 'bar',
                    },
                ],
            },
        ]);
    });
});

describe('convertTuple', () => {
    it('returns field node for primitive value', () => {
        const node = convertTuple('age', 30, t)!;

        expect(node).toEqual({
            type: FieldType.field,
            label: 'age',
            value: '30',
        });
    });

    it('returns undefined for null or empty string', () => {
        expect(convertTuple('foo', null, t)).toBeUndefined();
        expect(convertTuple('foo', '', t)).toBeUndefined();
    });

    it('creates a section for a nested object with children', () => {
        const value = { foo: 'bar' };

        const node = convertTuple('obj', value, t)!;

        expect(node).toEqual({
            type: FieldType.section,
            label: 'obj',
            children: [
                {
                    type: FieldType.field,
                    label: 'foo',
                    value: 'bar',
                },
            ],
        });
    });

    it('returns undefined for nested object with no convertible children', () => {
        const value = { foo: null };

        const node = convertTuple('obj', value, t);

        expect(node).toBeUndefined();
    });

    it('creates a section of subsections when key has subsection title mapping', () => {
        const value = [
            { line1: 'Home', city: 'New York' },
            { line1: 'Work', city: 'Boston' },
            { city: 'Missing title' }, // skipped because no line1
        ];

        const node = convertTuple('addresses', value, t)!;
        const sectionNode = node as DataSection;

        expect(sectionNode.type).toBe(FieldType.section);
        expect(sectionNode.label).toBe('addresses');
        expect(sectionNode.children).toHaveLength(2);

        const firstSection = sectionNode.children[0] as DataSection;
        expect(firstSection).toEqual({
            type: FieldType.section,
            label: 'Home',
            children: expect.arrayContaining([
                expect.objectContaining({
                    type: FieldType.field,
                    label: 'line1',
                    value: 'Home',
                }),
                expect.objectContaining({
                    type: FieldType.field,
                    label: 'city',
                    value: 'New York',
                }),
            ]),
        });
    });

    it('creates a group section when value is an array without subsection title mapping', () => {
        const value = [{ foo: 'bar' }, { baz: 'qux' }];

        const node = convertTuple('items', value, t)!;

        expect(node).toEqual({
            type: FieldType.section,
            label: 'items',
            children: [
                {
                    type: FieldType.group,
                    children: [
                        [{ type: FieldType.field, label: 'foo', value: 'bar' }],
                        [{ type: FieldType.field, label: 'baz', value: 'qux' }],
                    ],
                },
            ],
        });
    });
});

describe('transformNode', () => {
    const makeUppercaseLabelsTransform: TransformFunction = (
        node: DataNode
    ): DataNode | undefined => {
        if ('label' in node && typeof node.label === 'string') {
            return {
                ...node,
                label: node.label.toUpperCase(),
            } as DataNode;
        }
        return node;
    };

    it('applies transform to field nodes', () => {
        const field: DataField = {
            type: FieldType.field,
            label: 'name',
            value: 'Alice',
        };

        const transformed = transformNode(
            field,
            makeUppercaseLabelsTransform
        )! as DataField;

        expect(transformed.label).toBe('NAME');
        expect(transformed.value).toBe('Alice');
    });

    it('recursively transforms section children', () => {
        const node: DataSection = {
            type: FieldType.section,
            label: 'section',
            children: [
                {
                    type: FieldType.field,
                    label: 'child',
                    value: 'value',
                },
            ],
        };

        const transformed = transformNode(
            node,
            makeUppercaseLabelsTransform
        )! as DataSection;

        expect(transformed.label).toBe('SECTION');
        const child = transformed.children[0] as DataField;
        expect(child.label).toBe('CHILD');
    });

    it('recursively transforms group children', () => {
        const node: DataGroup = {
            type: FieldType.group,
            children: [
                [
                    {
                        type: FieldType.field,
                        label: 'child',
                        value: 'value',
                    },
                ],
            ],
        };

        const transformed = transformNode(
            node,
            makeUppercaseLabelsTransform
        )! as DataGroup;

        const child = transformed.children[0][0] as DataField;
        expect(child.label).toBe('CHILD');
    });

    it('drops nodes when transform returns undefined', () => {
        const dropAll = () => undefined;

        const field: DataNode = {
            type: FieldType.field,
            label: 'name',
            value: 'Alice',
        };

        const transformed = transformNode(field, dropAll);

        expect(transformed).toBeUndefined();
    });
});

describe('transformNodes', () => {
    it('applies single transform function to all nodes', () => {
        const nodes: DataNode[] = [
            { type: FieldType.field, label: 'a', value: '1' },
            { type: FieldType.field, label: 'b', value: '2' },
        ];

        const transform: TransformFunction = (
            node: DataNode
        ): DataNode | undefined => {
            if ('value' in node) {
                const fieldNode = node as DataField;
                return {
                    ...fieldNode,
                    value: String(fieldNode.value) + 'x',
                } as DataField;
            }
            return node;
        };

        const result = transformNodes({ nodes, transforms: transform });

        expect(result).toEqual([
            { type: FieldType.field, label: 'a', value: '1x' },
            { type: FieldType.field, label: 'b', value: '2x' },
        ]);
    });

    it('chains multiple transforms and filters out undefined results', () => {
        const nodes: DataNode[] = [
            { type: FieldType.field, label: 'a', value: '1' },
            { type: FieldType.field, label: 'b', value: '2' },
        ];

        const append: TransformFunction = (
            node: DataNode
        ): DataNode | undefined => {
            if ('value' in node) {
                const fieldNode = node as DataField;
                return {
                    ...fieldNode,
                    value: String(fieldNode.value) + '+',
                } as DataField;
            }
            return node;
        };

        const exclude: TransformFunction = (
            node: DataNode
        ): DataNode | undefined =>
            'label' in node && node.label === 'b' ? undefined : node;

        const result = transformNodes({ nodes, transforms: [append, exclude] });

        expect(result).toEqual([
            { type: FieldType.field, label: 'a', value: '1+' },
        ]);
    });
});

describe('applyTransformationsToNodes', () => {
    it('composes transformations left-to-right', () => {
        const initialTransform = (data: { value: number }[]): DataNode[] =>
            data.map((item) => ({
                type: FieldType.field,
                label: 'value',
                value: String(item.value),
            }));

        const multiplyValues = (nodes: DataNode[]): DataNode[] =>
            nodes.map((node) => {
                const fieldNode = node as DataField;
                return {
                    ...fieldNode,
                    value: String(Number(fieldNode.value) * 2),
                } as DataField;
            });

        const dropEvenResults = (nodes: DataNode[]): DataNode[] =>
            nodes.filter((node) => {
                const fieldNode = node as DataField;
                return Number(fieldNode.value) % 4 !== 0;
            });

        const pipe = applyTransformationsToNodes(
            initialTransform,
            multiplyValues,
            dropEvenResults
        );

        const result = pipe([{ value: 1 }, { value: 2 }, { value: 3 }]);

        expect(result).toEqual([
            { type: FieldType.field, label: 'value', value: '2' },
            { type: FieldType.field, label: 'value', value: '6' },
        ]);
    });

    it('throws a helpful error when a transform function throws', () => {
        const initialTransform = (data: { value: number }[]): DataNode[] =>
            data.map((item) => ({
                type: FieldType.field,
                label: 'value',
                value: String(item.value),
            }));

        const malformedTransform = (_nodes: DataNode[]): DataNode[] => {
            throw new Error('malformed transform');
        };

        const pipe = applyTransformationsToNodes(
            initialTransform,
            malformedTransform
        );

        expect(() => pipe([{ value: 1 }])).toThrow(
            /Error applying transformation in applyTransformationsToNodes: malformed transform/
        );
    });
});
