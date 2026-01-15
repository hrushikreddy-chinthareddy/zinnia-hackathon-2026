import { TFunction } from 'next-i18next';

import { DataGroup, DataNode, DataSection, FieldType } from '../types';
import { makeField, makeGroup, makeSection } from '../utils';
import {
    addAccountingEntriesGroup,
    getAllParties,
    groupBasicsForPolicy,
    groupBasicsForTransaction,
    groupTaxesSection,
} from './section-grouping';

jest.mock('./formatters', () => ({
    formatAsDataValue: ({ fieldData }: { fieldData: string }) =>
        `role:${fieldData}`,
    formatPartyLink: ({ partyId }: { partyId: string }) => `/party/${partyId}`,
}));

jest.mock('../data-node-helpers/traversal', () => {
    const actual = jest.requireActual('../data-node-helpers/traversal');
    return {
        ...actual,
    };
});

const t: TFunction = ((key: string) => key) as unknown as TFunction;

describe('addAccountingEntriesGroup', () => {
    it('returns original data when accounting entries are empty', () => {
        const originalData: DataNode[] = [makeSection('existing', [])];

        expect(addAccountingEntriesGroup(originalData, [])).toBe(originalData);
    });

    it('filters accounting entries down to allowed fields and appends accounting section', () => {
        const data: DataNode[] = [makeSection('existing', [])];
        const entry = makeSection('entry', [
            makeField('accountNumber', '123'),
            makeField('randomField', 'potatoes'),
            makeField('currency', 'USD'),
        ]);

        const result = addAccountingEntriesGroup(data, [entry]);

        expect(result).toHaveLength(2);
        const appendedSection = result[1] as DataSection;
        expect(appendedSection.type).toBe(FieldType.section);
        expect(appendedSection.label).toBe('accounting');
        expect(appendedSection.children).toHaveLength(1);

        const group = appendedSection.children[0] as DataGroup;

        expect(group.type).toEqual(FieldType.group);
        expect(group.children).toHaveLength(1);
        expect(group.children[0]).toEqual([
            makeField('accountNumber', '123'),
            makeField('currency', 'USD'),
        ]);
    });

    it('wraps non-section accounting entries and preserves them as-is', () => {
        const data: DataNode[] = [];
        const fieldEntry = makeField('amount', '42');

        const result = addAccountingEntriesGroup(data, [fieldEntry]);
        expect(result).toHaveLength(1);

        const accountingSection = result[0] as DataSection;
        const accountingGroup = accountingSection.children[0] as DataGroup;

        expect(accountingGroup.type).toEqual(FieldType.group);
        expect(accountingGroup.children[0]).toEqual([fieldEntry]);
    });
});

describe('groupBasicsForPolicy', () => {
    it('groups fields into policyBasics section and preserves other sections/groups', () => {
        const field1 = makeField('a', '1');
        const field2 = makeField('b', '2');
        const section = makeSection('details', [field1]);
        const group = makeGroup([[field2]]);

        const result = groupBasicsForPolicy([field1, section, group]);

        expect(result).toHaveLength(3);

        const basics = result[0] as DataSection;
        expect(basics.type).toBe(FieldType.section);
        expect(basics.label).toBe('policyBasics');
        expect(basics.children).toEqual([field1]);

        expect(result[1]).toBe(section);
        expect(result[2]).toBe(group);
    });
});

describe('groupBasicsForTransaction', () => {
    it('groups fields into transactionDetails section and preserves other sections/groups', () => {
        const field1 = makeField('a', '1');
        const section = makeSection('details', [field1]);
        const group = makeGroup([[field1]]);

        const result = groupBasicsForTransaction([field1, section, group]);

        expect(result).toHaveLength(3);

        const basics = result[0] as DataSection;
        expect(basics.type).toBe(FieldType.section);
        expect(basics.label).toBe('transactionDetails');
        expect(basics.children).toEqual([field1]);

        expect(result[1]).toBe(section);
        expect(result[2]).toBe(group);
    });
});

describe('groupTaxesSection', () => {
    it('combines tax basis, withholding instructions, and withheld amounts into a taxes section', () => {
        const taxBasisSection = makeSection('taxBasis', [
            makeField('basis1', 'B1'),
            makeField('basis2', 'B2'),
        ]);

        const withholdingSection = makeSection('taxWithholdingInstructions', [
            makeField('instruction', 'I1'),
        ]);

        const withheldSection = makeSection('taxWithheldAmounts', [
            makeField('amount', 'A1'),
        ]);

        const otherSection = makeSection('other', [makeField('x', '1')]);

        const result = groupTaxesSection([
            taxBasisSection,
            withholdingSection,
            withheldSection,
            otherSection,
        ]);

        // otherSection should be preserved
        const preserved = result.find(
            (n) =>
                n.type === FieldType.section &&
                (n as DataSection).label === 'other'
        ) as DataSection | undefined;
        expect(preserved).toBeDefined();

        const taxes = result.find(
            (n) =>
                n.type === FieldType.section &&
                (n as DataSection).label === 'taxes'
        ) as DataSection | undefined;

        expect(taxes).toBeDefined();
        expect(taxes!.children).toEqual([
            ...taxBasisSection.children,
            withholdingSection,
            withheldSection,
        ]);
    });
});

describe('getAllParties', () => {
    it('builds allParties and allPartiesById with roles, names, and contact info', () => {
        const partyRoles = makeSection('partyRoles', [
            makeSection('P1', [makeField('partyRole', 'OWNER')]),
        ]);

        // Build a minimal parties tree matching traversal expectations
        const partyNode = makeSection('partyNode', [
            makeField('partyId', 'P1'),
            makeField('firstName', 'John'),
            makeField('lastName', 'Doe'),
            makeField('fullName', 'Ignored Full'),
            makeField('agentExternalId', 'AGENT1'),
            makeField('dateOfBirth', '2000-01-01'),
        ]);

        const parties = makeSection('parties', [partyNode]);

        const policyNodes: DataNode[] = [partyRoles, parties];

        const { allParties, allPartiesById } = getAllParties({
            policyNodes,
            t,
            planCode: 'PLAN',
            policyNumber: 'POLICY',
        });

        expect(allParties).toHaveLength(1);
        const party = allParties[0];
        expect(party.type).toBe(FieldType.section);
        expect(party.label).toBe('P1');

        const nameField = party.children.find(
            (c) =>
                c.type === FieldType.field && (c as any).label === 'partyName'
        ) as any;
        expect(nameField.value).toBe('John Doe');
        expect(nameField.link).toBe('/party/P1');

        // tags should contain the formatted role
        expect(party.tags).toEqual(['role:OWNER']);

        expect(allPartiesById['P1']).toBe(party);
    });
});
