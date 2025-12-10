import {
    DataField,
    DataGroup,
    DataNode,
    DataSection,
    FieldType,
} from '../types';
import {
    isDataField,
    isDataGroup,
    isDataNode,
    isDataSection,
    isDataSectionOrField,
    isDataSectionOrGroup,
    isNonEmptyString,
    isNonNullishObject,
    isNotNullish,
    isPrimitive,
    isUnknownArray,
} from './predicates';

describe('isNotNullish', () => {
    it('returns false for null and undefined', () => {
        expect(isNotNullish(null)).toBe(false);
        expect(isNotNullish(undefined)).toBe(false);
    });

    it('returns true for other values', () => {
        expect(isNotNullish(0)).toBe(true);
        expect(isNotNullish('')).toBe(true);
        expect(isNotNullish(false)).toBe(true);
        expect(isNotNullish({})).toBe(true);
    });
});

describe('isDataNode', () => {
    it('returns true for a valid DataNode with known FieldType', () => {
        const node: DataField = {
            type: FieldType.field,
            label: 'foo',
            value: 'bar',
        };

        expect(isDataNode(node)).toBe(true);
    });

    it('returns false when type is missing or not a symbol', () => {
        expect(isDataNode({})).toBe(false);
        expect(isDataNode({ type: 'field' })).toBe(false);
    });

    it('returns false when type symbol is not in FieldType', () => {
        const node = {
            type: Symbol('not-a-valid-type'),
        } as unknown as DataNode;

        expect(isDataNode(node)).toBe(false);
    });
});

describe('data node type guards', () => {
    const section: DataSection = {
        type: FieldType.section,
        label: 'section',
        children: [],
    };

    const field: DataField = {
        type: FieldType.field,
        label: 'field',
        value: 'value',
    };

    const group: DataGroup = {
        type: FieldType.group,
        children: [],
    };

    it('isDataSection identifies section nodes', () => {
        expect(isDataSection(section)).toBe(true);
        expect(isDataSection(field as DataNode)).toBe(false);
        expect(isDataSection(group as DataNode)).toBe(false);
    });

    it('isDataField identifies field nodes', () => {
        expect(isDataField(field)).toBe(true);
        expect(isDataField(section as DataNode)).toBe(false);
        expect(isDataField(group as DataNode)).toBe(false);
    });

    it('isDataGroup identifies group nodes', () => {
        expect(isDataGroup(group)).toBe(true);
        expect(isDataGroup(section as DataNode)).toBe(false);
        expect(isDataGroup(field as DataNode)).toBe(false);
    });

    it('isDataSectionOrField matches only section or field nodes', () => {
        expect(isDataSectionOrField(section)).toBe(true);
        expect(isDataSectionOrField(field)).toBe(true);
        expect(isDataSectionOrField(group as DataNode)).toBe(false);
    });

    it('isDataSectionOrGroup matches only section or group nodes', () => {
        expect(isDataSectionOrGroup(section)).toBe(true);
        expect(isDataSectionOrGroup(group)).toBe(true);
        expect(isDataSectionOrGroup(field as DataNode)).toBe(false);
    });
});

describe('isPrimitive', () => {
    it('returns true for string, number, and boolean', () => {
        expect(isPrimitive('hello')).toBe(true);
        expect(isPrimitive(123)).toBe(true);
        expect(isPrimitive(false)).toBe(true);
    });

    it('returns false for non-primitive values', () => {
        expect(isPrimitive(null)).toBe(false);
        expect(isPrimitive(undefined)).toBe(false);
        expect(isPrimitive({})).toBe(false);
        expect(isPrimitive([])).toBe(false);
        expect(isPrimitive(Symbol('x'))).toBe(false);
    });
});

describe('isUnknownArray', () => {
    it('returns true for arrays', () => {
        expect(isUnknownArray([])).toBe(true);
        expect(isUnknownArray([1, 2, 3])).toBe(true);
    });

    it('returns false for non-arrays', () => {
        expect(isUnknownArray({})).toBe(false);
        expect(isUnknownArray('string')).toBe(false);
        expect(isUnknownArray(123)).toBe(false);
        expect(isUnknownArray(null)).toBe(false);
    });
});

describe('isNonNullishObject', () => {
    it('returns true for non-null objects', () => {
        expect(isNonNullishObject({})).toBe(true);
        expect(isNonNullishObject({ a: 1 })).toBe(true);
        expect(isNonNullishObject([])).toBe(true);
    });

    it('returns false for null or non-objects', () => {
        expect(isNonNullishObject(null)).toBe(false);
        expect(isNonNullishObject(undefined)).toBe(false);
        expect(isNonNullishObject('string')).toBe(false);
        expect(isNonNullishObject(123)).toBe(false);
    });
});

describe('isNonEmptyString', () => {
    it('returns true for non-empty strings', () => {
        expect(isNonEmptyString('a')).toBe(true);
        expect(isNonEmptyString('hello')).toBe(true);
    });

    it('returns false for empty strings and non-strings', () => {
        expect(isNonEmptyString('')).toBe(false);
        expect(isNonEmptyString(123)).toBe(false);
        expect(isNonEmptyString(null)).toBe(false);
        expect(isNonEmptyString(undefined)).toBe(false);
        expect(isNonEmptyString({})).toBe(false);
    });
});
