import { TFunction } from 'next-i18next';

import { PartyRoles, PayoutOptions } from '@deps/models/case/withdrawal/case';

export enum RelationshipToCoveredPerson {
    HUSBAND = 'HUSBAND',
    PARTNER = 'PARTNER',
    WIFE = 'WIFE',
    SPOUSE = 'SPOUSE',
    NA = 'NA',
}

export const DEFAULT_JOINT_PERSON_DATA = {
    partyRoleType: PartyRoles.JOINTCOVEREDPERSON,
    firstName: '',
    middleName: '',
    lastName: '',
    fullName: '',
    suffix: null,
    dob: { text: null },
    taxId: '',
    email: null,
    relationshipToOwnerAnnutant: RelationshipToCoveredPerson.NA,
    employer: null,
    maritalStatus: { text: null },
    addresses: [],
    phones: [],
};

export const relationshipToCoveredPerson = (t: TFunction) => [
    {
        label: t(
            'sswProgram.relationshipToCoveredPerson.relationshipOptions.husband'
        ),
        value: RelationshipToCoveredPerson.HUSBAND,
    },
    {
        label: t(
            'sswProgram.relationshipToCoveredPerson.relationshipOptions.partner'
        ),
        value: RelationshipToCoveredPerson.PARTNER,
    },
    {
        label: t(
            'sswProgram.relationshipToCoveredPerson.relationshipOptions.wife'
        ),
        value: RelationshipToCoveredPerson.WIFE,
    },
    {
        label: t(
            'sswProgram.relationshipToCoveredPerson.relationshipOptions.spouse'
        ),
        value: RelationshipToCoveredPerson.SPOUSE,
    },
    {
        label: t(
            'sswProgram.relationshipToCoveredPerson.relationshipOptions.na'
        ),
        value: RelationshipToCoveredPerson.NA,
    },
];

export const payoutOptions = (t: TFunction) => [
    {
        label: t('sswProgram.payout.payoutOptions.level'),
        value: PayoutOptions.level,
    },
    {
        label: t('sswProgram.payout.payoutOptions.increasing'),
        value: PayoutOptions.increasing,
    },
];
