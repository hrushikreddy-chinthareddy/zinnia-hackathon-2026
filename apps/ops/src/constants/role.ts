import { BeneRelationshipToInsured } from '@deps/containers/bene-change/components/beneficiary-details/allocation-details/allocation-details.helpers';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { SignatureDesignation } from '@deps/models/case/renewal/signature-validation';
import { PartyType } from '@zinnia/api-types/types/sor';

export const getRelationshipOptions = (t: (key: string) => string) => [
    {
        label: t('relationshipToParty.trustee'),
        value: BeneRelationshipToInsured.TRUSTEE,
    },
    {
        label: t('relationshipToParty.trusteeOfMinor'),
        value: BeneRelationshipToInsured.TRUSTEEOFMINOR,
    },
    {
        label: t('relationshipToParty.trusteeOfIncompetent'),
        value: BeneRelationshipToInsured.TRUSTEEOFINCOMPETENT,
    },
    {
        label: t('relationshipToParty.powerOfAttorney'),
        value: BeneRelationshipToInsured.POWEROFATTORNEY,
    },
    {
        label: t('relationshipToParty.controllingPersonOfEntity'),
        value: BeneRelationshipToInsured.CONTROLLINGPERSONOFENTITY,
    },
    {
        label: t('relationshipToParty.brother'),
        value: BeneRelationshipToInsured.BROTHER,
    },
    {
        label: t('relationshipToParty.child'),
        value: BeneRelationshipToInsured.CHILD,
    },
    {
        label: t('relationshipToParty.daughter'),
        value: BeneRelationshipToInsured.DAUGHTER,
    },
    {
        label: t('relationshipToParty.domesticPartner'),
        value: BeneRelationshipToInsured.DOMESTICPARTNER,
    },
    {
        label: t('relationshipToParty.executor'),
        value: BeneRelationshipToInsured.EXECUTOR,
    },
    {
        label: t('relationshipToParty.father'),
        value: BeneRelationshipToInsured.FATHER,
    },
    {
        label: t('relationshipToParty.fiance'),
        value: BeneRelationshipToInsured.FIANCE,
    },
    {
        label: t('relationshipToParty.grandchild'),
        value: BeneRelationshipToInsured.GRANDCHILD,
    },
    {
        label: t('relationshipToParty.lifePartner'),
        value: BeneRelationshipToInsured.LIFEPARTNER,
    },
    {
        label: t('relationshipToParty.mother'),
        value: BeneRelationshipToInsured.MOTHER,
    },
    {
        label: t('relationshipToParty.sister'),
        value: BeneRelationshipToInsured.SISTER,
    },
    {
        label: t('relationshipToParty.son'),
        value: BeneRelationshipToInsured.SON,
    },
    {
        label: t('relationshipToParty.spouse'),
        value: BeneRelationshipToInsured.SPOUSE,
    },
    {
        label: t('relationshipToParty.stepfather'),
        value: BeneRelationshipToInsured.STEPFATHER,
    },
    {
        label: t('relationshipToParty.stepmother'),
        value: BeneRelationshipToInsured.STEPMOTHER,
    },
    {
        label: t('relationshipToParty.self'),
        value: BeneRelationshipToInsured.SELF,
    },
    {
        label: t('relationshipToParty.business'),
        value: BeneRelationshipToInsured.BUSINESS,
    },
    {
        label: t('relationshipToParty.businessAssociate'),
        value: BeneRelationshipToInsured.BUSINESSASSOCIATE,
    },
    {
        label: t('relationshipToParty.partner'),
        value: BeneRelationshipToInsured.PARTNER,
    },
    {
        label: t('relationshipToParty.employer'),
        value: BeneRelationshipToInsured.EMPLOYER,
    },
    {
        label: t('relationshipToParty.formerSpouse'),
        value: BeneRelationshipToInsured.FORMERSPOUSE,
    },
    {
        label: t('relationshipToParty.grandparent'),
        value: BeneRelationshipToInsured.GRANDPARENT,
    },
    {
        label: t('relationshipToParty.parent'),
        value: BeneRelationshipToInsured.PARENT,
    },
    {
        label: t('relationshipToParty.owner'),
        value: BeneRelationshipToInsured.OWNER,
    },
    {
        label: t('relationshipToParty.sibling'),
        value: BeneRelationshipToInsured.SIBLING,
    },
    {
        label: t('relationshipToParty.stepchild'),
        value: BeneRelationshipToInsured.STEPCHILD,
    },
    {
        label: t('relationshipToParty.stepparent'),
        value: BeneRelationshipToInsured.STEPPARENT,
    },
    {
        label: t('relationshipToParty.other'),
        value: BeneRelationshipToInsured.OTHER,
    },
];

export const getRelationshipLabel = (
    value: string,
    t: (key: string) => string
) => {
    const options = getRelationshipOptions(t);
    const relationship = options.find((option) => option.value === value);
    return relationship ? relationship.label : toTitleCase(value);
};

export const getSignatureDesignationOptions = (t: (key: string) => string) => [
    { label: t('trustee'), value: SignatureDesignation.Trustee },
    { label: t('executor'), value: SignatureDesignation.Executor },
    { label: t('custodian'), value: SignatureDesignation.Custodian },
    { label: t('guardian'), value: SignatureDesignation.Guardian },
    {
        label: t('attorneyInFact'),
        value: SignatureDesignation.AttorneyInFact,
    },
    { label: t('assignee'), value: SignatureDesignation.Assignee },
    { label: t('na'), value: SignatureDesignation.NA },
];

export const getPartyTypeOptions = (t: (key: string) => string) => {
    const partyTypeOptions = [
        { label: t('partyOptions.individual'), value: PartyType.INDIVIDUAL },
        { label: t('partyOptions.trust'), value: PartyType.TRUST },
        {
            label: t('partyOptions.organization'),
            value: PartyType.ORGANIZATION,
        },
    ];
    return partyTypeOptions;
};
