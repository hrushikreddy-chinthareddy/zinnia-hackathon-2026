import { TFunction } from 'next-i18next';

import { BeneRelationshipToInsured } from '@deps/containers/bene-change/components/beneficiary-details/allocation-details/allocation-details.helpers';

import { ClaimFields, FieldConfig } from './other-notifier';

export default function getDeathClaimConfig(t: TFunction) {
    const relationshipToInsuredOptions = [
        {
            label: t('relationshipToInsured.associate'),
            value: BeneRelationshipToInsured.ASSOCIATE,
        },
        {
            label: t('relationshipToInsured.aunt'),
            value: BeneRelationshipToInsured.AUNT,
        },
        {
            label: t('relationshipToInsured.brother'),
            value: BeneRelationshipToInsured.BROTHER,
        },
        {
            label: t('relationshipToInsured.daughter'),
            value: BeneRelationshipToInsured.DAUGHTER,
        },
        {
            label: t('relationshipToInsured.father'),
            value: BeneRelationshipToInsured.FATHER,
        },
        {
            label: t('relationshipToInsured.fiance'),
            value: BeneRelationshipToInsured.FIANCE,
        },
        {
            label: t('relationshipToInsured.grandfather'),
            value: BeneRelationshipToInsured.GRANDFATHER,
        },
        {
            label: t('relationshipToInsured.grandmother'),
            value: BeneRelationshipToInsured.GRANDMOTHER,
        },
        {
            label: t('relationshipToInsured.grandchild'),
            value: BeneRelationshipToInsured.GRANDCHILD,
        },
        {
            label: t('relationshipToInsured.husband'),
            value: BeneRelationshipToInsured.HUSBAND,
        },
        {
            label: t('relationshipToInsured.mother'),
            value: BeneRelationshipToInsured.MOTHER,
        },
        {
            label: t('relationshipToInsured.partner'),
            value: BeneRelationshipToInsured.PARTNER,
        },
        {
            label: t('relationshipToInsured.sister'),
            value: BeneRelationshipToInsured.SISTER,
        },
        {
            label: t('relationshipToInsured.son'),
            value: BeneRelationshipToInsured.SON,
        },
        {
            label: t('relationshipToInsured.trustee'),
            value: BeneRelationshipToInsured.TRUSTEE,
        },
        {
            label: t('relationshipToInsured.wife'),
            value: BeneRelationshipToInsured.WIFE,
        },
        {
            label: t('relationshipToInsured.uncle'),
            value: BeneRelationshipToInsured.UNCLE,
        },
        {
            label: t('relationshipToInsured.niece'),
            value: BeneRelationshipToInsured.NIECE,
        },
        {
            label: t('relationshipToInsured.nephew'),
            value: BeneRelationshipToInsured.NEPHEW,
        },
        {
            label: t('relationshipToInsured.self'),
            value: BeneRelationshipToInsured.SELF,
        },
        {
            label: t('relationshipToInsured.estate'),
            value: BeneRelationshipToInsured.ESTATE,
        },
        {
            label: t('relationshipToInsured.trust'),
            value: BeneRelationshipToInsured.TRUST,
        },
        {
            label: t('relationshipToInsured.spouse'),
            value: BeneRelationshipToInsured.SPOUSE,
        },
        {
            label: t('relationshipToInsured.grandson'),
            value: BeneRelationshipToInsured.GRANDSON,
        },
        {
            label: t('relationshipToInsured.granddaughter'),
            value: BeneRelationshipToInsured.GRANDDAUGHTER,
        },
        {
            label: t('relationshipToInsured.parent'),
            value: BeneRelationshipToInsured.PARENT,
        },
        {
            label: t('relationshipToInsured.child'),
            value: BeneRelationshipToInsured.CHILD,
        },
        {
            label: t('relationshipToInsured.nonSpouse'),
            value: BeneRelationshipToInsured.NONSPOUSE,
        },
        {
            label: t('relationshipToInsured.childrenEqually'),
            value: BeneRelationshipToInsured.CHILDRENEQUALLY,
        },
        {
            label: t('relationshipToInsured.childrenPerStirpes'),
            value: BeneRelationshipToInsured.CHILDRENPERSTIRPES,
        },
        {
            label: t('relationshipToInsured.perStirpes'),
            value: BeneRelationshipToInsured.PERSTIRPES,
        },
        {
            label: t('relationshipToInsured.survivingSpouse'),
            value: BeneRelationshipToInsured.SURVIVINGSPOUSE,
        },
        {
            label: t('relationshipToInsured.other'),
            value: BeneRelationshipToInsured.OTHER,
        },
    ];

    const otherRoleFields: FieldConfig[] = [
        {
            fieldName: ClaimFields.FirstName,
            fieldLabel: t('labels.otherNotifier.firstName'),
        },
        {
            fieldName: ClaimFields.MiddleName,
            fieldLabel: t('labels.otherNotifier.middleName'),
        },
        {
            fieldName: ClaimFields.LastName,
            fieldLabel: t('labels.otherNotifier.lastName'),
        },
        {
            fieldName: ClaimFields.Suffix,
            fieldLabel: t('labels.otherNotifier.suffix'),
        },
        {
            fieldName: ClaimFields.RelationShipToDeceased,
            fieldLabel: t('labels.otherNotifier.relationshipToDeceased'),
            fieldOption: relationshipToInsuredOptions,
            placeHolder: t('labels.otherNotifier.select') as string,
        },
    ];

    const newBeneFields: FieldConfig[] = [
        {
            fieldName: ClaimFields.FirstName,
            fieldLabel: t('labels.otherNotifier.firstName'),
        },
        {
            fieldName: ClaimFields.MiddleName,
            fieldLabel: t('labels.otherNotifier.middleName'),
        },
        {
            fieldName: ClaimFields.LastName,
            fieldLabel: t('labels.otherNotifier.lastName'),
        },
        {
            fieldName: ClaimFields.Suffix,
            fieldLabel: t('labels.otherNotifier.suffix'),
        },
    ];

    return {
        relationshipToInsuredOptions,
        otherRoleFields,
        newBeneFields,
    };
}
