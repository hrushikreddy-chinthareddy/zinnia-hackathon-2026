import { TFunction } from 'next-i18next';

import { NewTrustType, PolicyRole } from '@deps/constants/policy';
import { Gender, PartyType, SuffixEnum } from '@zinnia/api-types/types/sor';
export interface Errors {
    firstName?: string;
    lastName?: string;
}

export enum TrustType {
    Corporate = 'Corporate Trust',
    Individual = 'Individual Trust',
    LookThrough = 'Look Through Trust',
}

export enum Prefix {
    'DR' = 'DR',
    'MR' = 'MR',
    'MRS' = 'MRS',
    'MS' = 'MS',
}

export const prefixOption = (t: TFunction) => [
    {
        label: t('prefixOptions.dr'),
        value: 'Dr.',
    },
    {
        label: t('prefixOptions.mr'),
        value: 'Mr.',
    },
    {
        label: t('prefixOptions.mrs'),
        value: 'Mrs.',
    },
    {
        label: t('prefixOptions.ms'),
        value: 'Ms.',
    },
];

export const newPrefixOption = (t: TFunction) => [
    {
        label: t('prefixOptions.dr'),
        value: Prefix.DR,
    },
    {
        label: t('prefixOptions.mr'),
        value: Prefix.MR,
    },
    {
        label: t('prefixOptions.mrs'),
        value: Prefix.MRS,
    },
    {
        label: t('prefixOptions.ms'),
        value: Prefix.MS,
    },
];

export const genderOption = (t: TFunction) => [
    {
        label: t('male'),
        value: Gender.MALE,
    },
    {
        label: t('female'),
        value: Gender.FEMALE,
    },
];

export const trustOption = (t: TFunction) => [
    {
        label: t('corporateTrust'),
        value: TrustType.Corporate,
    },
    {
        label: t('individualTrust'),
        value: TrustType.Individual,
    },
    {
        label: t('lookThrough'),
        value: TrustType.LookThrough,
    },
];

export const suffixOptions = (t: TFunction) => [
    {
        label: t('suffixOptions.jr'),
        value: SuffixEnum.JR,
    },
    {
        label: t('suffixOptions.sn'),
        value: SuffixEnum.SN,
    },
    {
        label: t('suffixOptions.i'),
        value: SuffixEnum.I,
    },
    {
        label: t('suffixOptions.ii'),
        value: SuffixEnum.II,
    },
    {
        label: t('suffixOptions.iii'),
        value: SuffixEnum.III,
    },
];

export const newTrustOptions = (t: TFunction) => [
    {
        label: t('individualTrust'),
        value: NewTrustType.Individual,
    },
    {
        label: t('corporateTrust'),
        value: NewTrustType.Corporate,
    },
    {
        label: t('testamentaryTrust'),
        value: NewTrustType.Testamentary,
    },
    {
        label: t('interVivosTrust'),
        value: NewTrustType.InterVivos,
    },
    {
        label: t('grantorTrust'),
        value: NewTrustType.Grantor,
    },
];

export const formatPrefix = (prefix: string | undefined | null): string => {
    if (!prefix) return '';

    const trimmedPrefix = prefix.trim().toUpperCase();

    const prefixMap: Record<string, string> = {
        MR: 'Mr.',
        MRS: 'Mrs.',
        DR: 'Dr.',
        MS: 'Ms.',
    };

    return prefixMap[trimmedPrefix] || prefix;
};

export const normalizePrefix = (
    prefix: string | undefined | null
): Prefix | null => {
    if (!prefix) return null;

    const trimmedPrefix = prefix.trim().toUpperCase().replace(/\./g, '');

    switch (trimmedPrefix) {
        case Prefix.DR:
            return Prefix.DR;
        case Prefix.MR:
            return Prefix.MR;
        case Prefix.MRS:
            return Prefix.MRS;
        case Prefix.MS:
            return Prefix.MS;
        default:
            return prefix as Prefix;
    }
};

export const formatSuffix = (
    suffix: SuffixEnum | string | undefined | null
): string => {
    if (!suffix) return '';

    const trimmedSuffix = suffix.trim().toUpperCase().replace(/\./g, '');

    const suffixMap: Record<string, string> = {
        [SuffixEnum.JR]: 'JR',
        [SuffixEnum.SN]: 'SN',
        [SuffixEnum.I]: 'I',
        [SuffixEnum.II]: 'II',
        [SuffixEnum.III]: 'III',
    };

    return suffixMap[trimmedSuffix] || suffix;
};

export const normalizeSuffix = (
    suffix: SuffixEnum | string | undefined | null
): SuffixEnum | null => {
    if (!suffix) return null;

    const trimmedSuffix = suffix.trim().toUpperCase().replace(/\./g, '');

    switch (trimmedSuffix) {
        case SuffixEnum.JR:
            return SuffixEnum.JR;
        case 'SR':
        case SuffixEnum.SN:
            return SuffixEnum.SN;
        case SuffixEnum.I:
            return SuffixEnum.I;
        case SuffixEnum.II:
            return SuffixEnum.II;
        case SuffixEnum.III:
            return SuffixEnum.III;
        default:
            return suffix as SuffixEnum;
    }
};

export const rolePartyCheck = (partyType: PartyType): boolean => {
    return (
        partyType === PartyType.TRUST || partyType === PartyType.ORGANIZATION
    );
};

export const roleCheck = (role: PolicyRole): boolean => {
    return [
        PolicyRole.OWNER,
        PolicyRole.JOINTOWNER,
        PolicyRole.THIRDPARTYDESIGNEE,
    ].includes(role);
};
