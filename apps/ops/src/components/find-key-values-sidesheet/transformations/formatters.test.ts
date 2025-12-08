import { TFunction } from 'next-i18next';

import { DataField, DataNode, DataSection, FieldType } from '../types';
import {
    addLinkToPartyId,
    addToolTip,
    formatAsDataLabel,
    formatAsDataValue,
    formatDataField,
    formatNode,
    formatPartyLink,
} from './formatters';
import { makeField, makeSection } from '../utils';

jest.mock('@deps/helpers/numbers.helpers', () => ({
    numberFormatify: (n: number) => `$${n}`,
    percentFormatify: (n: number, _opts: { isInteger: boolean }) => `${n}%`,
}));

jest.mock('@deps/helpers/string.helpers', () => ({
    convertKebabedDateString: (s?: string) =>
        s ? `date:${s}` : 'date:invalid',
}));

jest.mock('@deps/utils/strings', () => ({
    DEFAULT_ERROR_STRING: '--',
}));

jest.mock('../translations/currency-fields', () => ({
    currencyFields: new Set(['premiumAmount']),
}));

jest.mock('../translations/date-fields', () => ({
    dateFields: new Set(['effectiveDate']),
}));

jest.mock('../translations/percentage-fields', () => ({
    percentageFields: new Set(['allocationPercent']),
}));

jest.mock('../translations/grammar-corrections', () => ({
    grammarCorrections: {
        recieved: 'received',
    },
}));

jest.mock('../translations/industry-term-to-abbrev', () => ({
    industryTermToAbbrev: {
        annualPercentageRate: 'APR',
    },
}));

jest.mock('../data-node-helpers/traversal', () => ({
    findFieldInNode: jest.fn(),
}));

const t: TFunction = ((key: string) => key) as unknown as TFunction;

describe('formatAsDataLabel', () => {
    it('returns exact translation when available', () => {
        const result = formatAsDataLabel({
            label: 'explicitLabel',
            policyNomenclature: 'policy',
            t,
        });

        expect(result).toBe('allFields.explicitLabel');
    });

    it('falls back to formatted label when no exact translation', () => {
        const result = formatAsDataLabel({
            label: 'annualPercentageRatePolicy',
            policyNomenclature: 'contract',
            t,
        });

        // splitIntoWords + replaceLineOfBusinessWords + industry/grammar + sentence case
        expect(result).toBe('allFields.annualPercentageRatePolicy');
    });
});

describe('formatAsDataValue', () => {
    it('uses enum translation when available', () => {
        const result = formatAsDataValue({
            fieldData: 'KNOWN_ENUM',
            t,
        });

        expect(result).toBe('enums.KNOWN_ENUM');
    });

    it('formats currency, percentage, and date based on field name', () => {
        const currency = formatAsDataValue({
            fieldName: 'premiumAmount',
            fieldData: '100',
            t,
        });

        const percent = formatAsDataValue({
            fieldName: 'allocationPercent',
            fieldData: '25',
            t,
        });

        const date = formatAsDataValue({
            fieldName: 'effectiveDate',
            fieldData: '2024-01-01',
            t,
        });

        expect(currency).toBe('$100');
        expect(percent).toBe('25%');
        expect(date).toBe('date:2024-01-01');
    });

    it('returns raw fieldData string when no special formatting applies', () => {
        const result = formatAsDataValue({
            fieldData: 'plain value',
            t,
        });

        expect(result).toBe('enums.plain value');
    });
});

describe('formatDataField', () => {
    it('formats both label and value using helpers', () => {
        const result = formatDataField({
            fieldName: 'premiumAmount',
            fieldData: '200',
            policyNomenclature: 'policy',
            t,
        });

        expect(result.value).toBe('$200');
        expect(result.label).toBe('allFields.premiumAmount');
    });
});

describe('addToolTip', () => {
    it('adds tooltip for field nodes', () => {
        const field = makeField('partyId', '123');

        const result = addToolTip({
            node: field,
            t,
            policyNomenclature: 'policy',
        }) as DataField;

        expect(result.toolTip).toBe('policy.toolTips.partyId');
    });

    it('returns unmodified node for non-field nodes', () => {
        const section = makeSection('section', []);

        const result = addToolTip({
            node: section,
            t,
            policyNomenclature: 'policy',
        });

        expect(result).toBe(section);
    });
});

describe('formatNode', () => {
    it('formats field nodes label and value', () => {
        const field = makeField('premiumAmount', '150');

        const result = formatNode({
            node: field,
            t,
            policyNomenclature: 'policy',
        }) as DataField;

        expect(result.value).toBe('$150');
        expect(result.label).toBe('allFields.premiumAmount');
    });

    it('formats section labels but leaves children untouched', () => {
        const section = makeSection('explicitLabel', [makeField('foo', 'bar')]);

        const result = formatNode({
            node: section,
            t,
            policyNomenclature: 'policy',
        }) as DataSection;

        expect(result.label).toBe('allFields.explicitLabel');
        expect(result.children).toHaveLength(1);
        expect(result.children[0]).toEqual(makeField('foo', 'bar'));
    });

    it('returns group nodes unchanged', () => {
        const group: DataNode = {
            type: FieldType.group,
            children: [[makeField('a', '1')]],
        } as any;

        const result = formatNode({
            node: group,
            t,
            policyNomenclature: 'policy',
        });

        expect(result).toBe(group);
    });
});

describe('addLinkToPartyId', () => {
    const { findFieldInNode } = jest.requireMock(
        '../data-node-helpers/traversal'
    );

    beforeEach(() => {
        (findFieldInNode as jest.Mock).mockReset();
    });

    it('returns node unchanged when not a partyId field', () => {
        const field = makeField('otherField', '123');

        const result = addLinkToPartyId({
            node: field,
            planCode: 'PLAN',
            policyNumber: 'POLICY',
            allPartiesById: {},
        });

        expect(result).toBe(field);
    });

    it('adds link when no party reference exists', () => {
        const field = makeField('partyId', 'P1');

        const result = addLinkToPartyId({
            node: field,
            planCode: 'PLAN',
            policyNumber: 'POLICY',
            allPartiesById: {},
        }) as DataField;

        expect(result.link).toBe('/policies/PLAN/POLICY/people/P1');
        expect(result.label).toBe('impactedParty');
        expect(result.value).toBe('P1');
    });

    it('relabels and uses party name when party reference exists', () => {
        const field = makeField('partyId', 'P1');

        const partySection: DataSection = {
            type: FieldType.section,
            label: 'party',
            children: [],
        };

        (findFieldInNode as jest.Mock).mockReturnValue({
            type: FieldType.field,
            label: 'partyName',
            value: 'John Doe',
            link: '/people/P1',
        } as DataField);

        const result = addLinkToPartyId({
            node: field,
            planCode: 'PLAN',
            policyNumber: 'POLICY',
            allPartiesById: { P1: partySection },
        }) as DataField;

        expect(result.label).toBe('impactedParty');
        expect(result.value).toBe('John Doe');
        expect(result.link).toBe('/people/P1');
    });
});

describe('formatPartyLink', () => {
    it('constructs the correct party profile URL', () => {
        const link = formatPartyLink({
            partyId: 'P1',
            planCode: 'PLAN',
            policyNumber: 'POLICY',
        });

        expect(link).toBe('/policies/PLAN/POLICY/people/P1');
    });
});
