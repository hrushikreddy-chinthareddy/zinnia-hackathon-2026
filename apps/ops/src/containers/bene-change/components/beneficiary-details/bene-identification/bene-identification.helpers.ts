import { Gender } from '@zinnia/api-types/types/sor';
import { TFunction } from 'next-i18next';

export interface Errors {
    firstName?: string;
    lastName?: string;
}

export enum TrustType {
    Corporate = 'Corporate Trust',
    Individual = 'Individual Trust',
    LookThrough = 'Look Through Trust',
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
        value: 'JR',
    },
    {
        label: t('suffixOptions.sn'),
        value: 'SN',
    },
    {
        label: t('suffixOptions.i'),
        value: 'I',
    },
    {
        label: t('suffixOptions.ii'),
        value: 'II',
    },
    {
        label: t('suffixOptions.iii'),
        value: 'III',
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
