import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { TimeZoneAbbreviations } from '@deps/data/time-zones';
import { isEndDated } from '@deps/helpers/date.helpers';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

export const ENTERPRISE_PHONE_TYPE = {
    FAX: 'FAX',
    BUSINESS: 'BUSINESS',
    MOBILE: 'MOBILE',
    HOMEFAX: 'HOMEFAX',
    MODEM: 'MODEM',
    HOME: 'HOME',
    SECONDARYHOME: 'SECONDARYHOME',
    OTHER: 'OTHER',
};

export type EnterprisePhoneType =
    (typeof ENTERPRISE_PHONE_TYPE)[keyof typeof ENTERPRISE_PHONE_TYPE];

export interface EnterprisePhone {
    /** Area code */
    areaCode?: string;
    /** Best time */
    bestTime?: string;
    /** Country code */
    countryCode?: string;
    /** Dial number */
    dialNumber?: string;
    /** Date (with pattern "yyyy-mm-dd") */
    endDate?: string;
    /** Extension */
    extension?: string;
    phoneType?: EnterprisePhoneType;
    /** Date (with pattern "yyyy-mm-dd") */
    startDate?: string;
    /** Timezone for the entered phone details */
    timezone?: string;
    /** Id of the phone */
    phoneId?: string;
}

export interface EnterprisePhones {
    phones?: EnterprisePhone[];
}

interface TProps {
    t: TFunction;
}

type GetBestTimeOptions = TProps;
type GetPhoneTypeOptions = TProps;
type GetTimeZoneOptions = TProps;

export const getPhoneBestTimeOptions = ({ t }: GetBestTimeOptions) => [
    {
        label: t('labels.bestTimesOptions.morning'),
        value: 'Morning',
    },
    {
        label: t('labels.bestTimesOptions.afternoon'),
        value: 'Afternoon',
    },
    {
        label: t('labels.bestTimesOptions.evening'),
        value: 'Evening',
    },
    {
        label: t('labels.bestTimesOptions.anytime'),
        value: 'Anytime',
    },
];

export const getPhoneTypeOptions = ({ t }: GetPhoneTypeOptions) => [
    {
        label: t('labels.phoneOptions.businessFax'),
        value: ENTERPRISE_PHONE_TYPE.FAX,
    },
    {
        label: t('labels.phoneOptions.businessPhone'),
        value: ENTERPRISE_PHONE_TYPE.BUSINESS,
    },
    {
        label: t('labels.phoneOptions.mobilePhone'),
        value: ENTERPRISE_PHONE_TYPE.MOBILE,
    },
    {
        label: t('labels.phoneOptions.homeFax'),
        value: ENTERPRISE_PHONE_TYPE.HOMEFAX,
    },
    {
        label: t('labels.phoneOptions.modem'),
        value: ENTERPRISE_PHONE_TYPE.MODEM,
    },
    {
        label: t('labels.phoneOptions.homePhone'),
        value: ENTERPRISE_PHONE_TYPE.HOME,
    },
    {
        label: t('labels.phoneOptions.secondaryHomePhone'),
        value: ENTERPRISE_PHONE_TYPE.SECONDARYHOME,
    },
    {
        label: t('labels.phoneOptions.other'),
        value: ENTERPRISE_PHONE_TYPE.OTHER,
    },
];

export const getTimeZoneOptions = ({ t }: GetTimeZoneOptions) => [
    {
        //  blank values for deselecting options
        label: '\u200b',
        value: ' ',
    },
    {
        label: t(`labels.timeZoneOptions.${TimeZoneAbbreviations.akt}`, {
            abbreviation: TimeZoneAbbreviations.akt,
        }),
        value: TimeZoneAbbreviations.akt,
    },
    {
        label: t(`labels.timeZoneOptions.${TimeZoneAbbreviations.ct}`, {
            abbreviation: TimeZoneAbbreviations.ct,
        }),
        value: TimeZoneAbbreviations.ct,
    },
    {
        label: t(`labels.timeZoneOptions.${TimeZoneAbbreviations.et}`, {
            abbreviation: TimeZoneAbbreviations.et,
        }),
        value: TimeZoneAbbreviations.et,
    },
    {
        label: t(`labels.timeZoneOptions.${TimeZoneAbbreviations.ht}`, {
            abbreviation: TimeZoneAbbreviations.ht,
        }),
        value: TimeZoneAbbreviations.ht,
    },
    {
        label: t(`labels.timeZoneOptions.${TimeZoneAbbreviations.mt}`, {
            abbreviation: TimeZoneAbbreviations.mt,
        }),
        value: TimeZoneAbbreviations.mt,
    },
    {
        label: t(`labels.timeZoneOptions.${TimeZoneAbbreviations.pt}`, {
            abbreviation: TimeZoneAbbreviations.pt,
        }),
        value: TimeZoneAbbreviations.pt,
    },
];

export const INITIAL_PHONE: EnterprisePhone = {
    countryCode: '1',
    phoneType: ENTERPRISE_PHONE_TYPE.HOME,
    startDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
};

export const getHomePhone = ({
    phones,
}: EnterprisePhones): EnterprisePhone[] => {
    if (!phones) return [];

    const validPhones =
        phones?.filter(
            (phone) => phone.dialNumber !== null && !isEndDated(phone.endDate)
        ) ?? [];

    const homePhones: EnterprisePhone[] = [];

    validPhones.forEach((validPhone) => {
        switch (validPhone.phoneType) {
            case ENTERPRISE_PHONE_TYPE.HOME:
                homePhones.push(validPhone);
                break;
        }
    });

    return [...homePhones];
};

export const getPhones = ({ phones }: EnterprisePhones): EnterprisePhone[] => {
    if (!phones) return [];

    const validPhones =
        phones?.filter(
            (phone) => phone.dialNumber !== null && !isEndDated(phone.endDate)
        ) ?? [];

    return validPhones;
};

export function formatPhoneNumber(phone: EnterprisePhone): string {
    let rawNumber = '';
    if (phone.areaCode) {
        rawNumber += phone.areaCode;
    }
    if (phone.dialNumber) {
        rawNumber += phone.dialNumber;
    }
    return rawNumber;
}

export function formatPhoneNumberWithCountryCode(
    phone: EnterprisePhone
): string {
    let formattedNumber = '';
    if (phone.countryCode) {
        formattedNumber += `+${phone.countryCode}`;
    }
    if (phone.areaCode) {
        formattedNumber += ` (${phone.areaCode}) `;
    }
    if (phone.dialNumber) {
        formattedNumber += `${phone.dialNumber.substring(
            0,
            3
        )}-${phone.dialNumber.substring(3, 8)}`;
    }
    return formattedNumber;
}
