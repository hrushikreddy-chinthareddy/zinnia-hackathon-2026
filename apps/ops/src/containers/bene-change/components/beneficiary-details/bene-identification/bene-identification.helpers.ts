import { Gender, Suffix } from '@zinnia/api-types/types/sor';
import { TFunction } from 'next-i18next';

import { NewTrustType } from '@deps/constants/policy';

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
        value: Suffix.JR,
    },
    {
        label: t('suffixOptions.sn'),
        value: Suffix.SN,
    },
    {
        label: t('suffixOptions.i'),
        value: Suffix.I,
    },
    {
        label: t('suffixOptions.ii'),
        value: Suffix.II,
    },
    {
        label: t('suffixOptions.iii'),
        value: Suffix.III,
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
