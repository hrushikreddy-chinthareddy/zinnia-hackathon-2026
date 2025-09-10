import {
    IdentificationType,
    Party,
    PartyType,
    Policy,
} from '@zinnia/api-types/types/sor';
import { TagVariant } from '@zinnia/bloom/components';
import { TFunction } from 'next-i18next';

import {
    BeneficiaryItem,
    ExtendedParty,
} from '@deps/contexts/BeneChangeContext';
import { areObjectsDifferent } from '@deps/helpers/objects.helpers';
import { getFullName } from '@deps/helpers/party-info-helpers';
import { toTitleCase } from '@deps/helpers/string.helpers';

import { getFormattedAddress, getFormattedPhone } from './beneficiary-summary';
import { ENTERPRISE_ADDRESS_TYPE } from '../../beneficiary-details/address-details/address-details.helpers';

export const getTagVariant = (action: string, t: TFunction) => {
    let tagVariant = '';
    let tagText = '';
    if (action === 'NONE') {
        tagVariant = TagVariant.White;
        tagText = t('tag.none');
    } else if (action === 'UPDATE') {
        tagVariant = TagVariant.Information;
        tagText = t('tag.updated');
    } else if (action === 'DELETE') {
        tagVariant = TagVariant.White;
        tagText = t('tag.removed');
    } else if (action === 'ADD') {
        tagVariant = TagVariant.Information;
        tagText = t('tag.new');
    }

    return { tagVariant, tagText };
};

export const DEFAULT_BENE_ADDRESS = {
    addressType: ENTERPRISE_ADDRESS_TYPE.HOME,
    country: 'US',
};

export const isEqualObjects = (obj1: any, obj2: any) => {
    const diffInFields = Object.entries(obj2).filter(
        ([field, obj2Value]) => obj1[field] !== obj2Value
    );
    return diffInFields.length > 0 ? false : true;
};

export const hasBeneficiaryChanged = (
    item: BeneficiaryItem,
    currentData: Party[],
    policy: Policy
): boolean => {
    const existingParty = currentData?.find(
        (element: any) => element.partyId === item?.partyRole?.partyId
    );

    if (!existingParty) {
        return true;
    }

    const partyId = item?.partyRole?.partyId;
    const relationshipToParty =
        partyId &&
        policy?.partyRoles?.find((role) => role?.partyId === partyId)
            ?.relationshipToParty;
    const currentRelationship = item?.party?.allocation?.relationshipToParty;

    const partyInfo = item?.party?.info ?? {};
    const partyType = partyInfo?.partyType;

    const fullName = getFullName(partyInfo as Party)
        ? getFullName(partyInfo as Party)
        : toTitleCase(partyInfo?.fullName);
    const existingfullName = getFullName(existingParty as Party)
        ? getFullName(existingParty as Party)
        : toTitleCase(existingParty?.fullName);

    const infoChanged =
        fullName !== existingfullName ||
        existingParty?.dateOfBirth !== item?.party?.info?.dateOfBirth ||
        existingParty?.gender !== item?.party?.info?.gender ||
        (partyInfo.partyType == PartyType.TRUST &&
            existingParty?.trustType !== partyInfo?.trustType) ||
        existingParty?.trustDate !== partyInfo?.trustDate;

    const allocationChanged =
        existingParty?.beneficiaryPercentage !==
        item?.party?.allocation?.beneficiaryPercentage;

    const existingIdentification = existingParty?.identifications?.find(
        (id: any) => id.identificationType === IdentificationType.SSN
    );

    const identificationChanged =
        existingIdentification?.identificationValue !== item?.party?.info?.ssn;

    const relationshipChanged = currentRelationship !== relationshipToParty;

    const existingAddress = getFormattedAddress(
        existingParty?.addresses?.[0] ?? {}
    );
    const updatedAddress = getFormattedAddress(
        item?.party?.addresses?.[0] ?? {}
    );
    const addressChanged = areObjectsDifferent(existingAddress, updatedAddress);

    const existingPhone = getFormattedPhone(existingParty?.phones?.[0] ?? {});
    const updatedPhone = getFormattedPhone(item?.party?.phones?.[0] ?? {});
    const phoneChanged = areObjectsDifferent(existingPhone, updatedPhone);

    const existingEmail = existingParty?.emails?.[0]?.emailAddress;
    const updatedEmail = item?.party?.emails?.[0]?.emailAddress;
    const emailChanged = existingEmail !== updatedEmail;

    const { isPerStirpes = false, isIrrevocable = false } =
        item?.beneInfo || {};

    const existingIsPerStirpes =
        (existingParty as ExtendedParty)?.isPerStirpes || false;
    const existingIsIrrevocable = existingParty?.isIrrevocable || false;

    const designationChanged =
        existingIsPerStirpes !== isPerStirpes ||
        existingIsIrrevocable !== isIrrevocable;

    return (
        infoChanged ||
        allocationChanged ||
        identificationChanged ||
        addressChanged ||
        phoneChanged ||
        emailChanged ||
        designationChanged ||
        relationshipChanged
    );
};
