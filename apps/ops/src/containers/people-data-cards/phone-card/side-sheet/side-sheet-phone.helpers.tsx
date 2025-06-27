import { Phone, PhoneType } from '@zinnia/api-types/types/sor';
import { countries } from 'countries-list';
import { TFunction, useTranslation } from 'next-i18next';

import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { TimeZoneAbbreviations } from '@deps/data/time-zones';
import { formatPhoneNumberWithExtension } from '@deps/helpers/phone.helpers';
import { mapPhoneTypeToTranslation } from '@deps/helpers/translation.helpers';

interface CountryCodeLabelProps {
    countryCode: keyof typeof countries;
}

interface PhoneDetailsProps {
    phone: Phone;
}

export interface Errors {
    caseId?: string;
    phoneNumber?: string;
}

interface TProps {
    t: TFunction;
}

type GetBestTimeOptions = TProps;
type GetPhoneTypeOptions = TProps;
type GetTimeZoneOptions = TProps;

interface GetFormErrors {
    isDelete?: boolean;
    caseId?: string;
    phone: Phone;
    t: TFunction;
}

const CountryCodeLabel = ({ countryCode }: CountryCodeLabelProps) => {
    return (
        <p className="flex gap-2">
            <span>{countries[countryCode].emoji}</span>
            <span>{countries[countryCode].name}</span>
            <span>+{countries[countryCode].phone}</span>
        </p>
    );
};

export const PhoneDetails = ({ phone }: PhoneDetailsProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.sideSheet.phone',
    });
    const { t: defaultT } = useTranslation();

    const { bestTime, phoneType, timezone } = phone;

    const phoneTypeTranslation = mapPhoneTypeToTranslation(phoneType, defaultT);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <Label
                    label={t('fieldLabels.type')}
                    variant={LabelVariant.FieldLabel}
                />
                <Typography variant={TypographyVariant.BodySm}>
                    {phoneTypeTranslation}
                </Typography>
            </div>
            <div>
                <Label
                    label={t('fieldLabels.number')}
                    variant={LabelVariant.FieldLabel}
                />
                <Typography variant={TypographyVariant.BodySm}>
                    {formatPhoneNumberWithExtension(phone)}
                </Typography>
            </div>
            {bestTime && (
                <div>
                    <Label
                        label={t('fieldLabels.preferredTime')}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Typography variant={TypographyVariant.BodySm}>
                        {bestTime}
                    </Typography>
                </div>
            )}
            {timezone && (
                <div>
                    <Label
                        label={t('fieldLabels.timeZone')}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Typography variant={TypographyVariant.BodySm}>
                        {defaultT(
                            `people.card.phone.timeZoneOptions.${timezone}`,
                            { abbreviation: timezone }
                        )}
                    </Typography>
                </div>
            )}
        </div>
    );
};

export const frequentCountryOptions = [
    {
        label: <CountryCodeLabel countryCode="US" />,
        value: 'US',
    },
    {
        label: <CountryCodeLabel countryCode="GB" />,
        value: 'GB',
    },
    {
        label: <CountryCodeLabel countryCode="CA" />,
        value: 'CA',
    },
];

export const countryOptions = Object.keys(countries).map((key) => {
    return {
        label: <CountryCodeLabel countryCode={key as keyof typeof countries} />,
        value: key,
    };
});

export const getBestTimeOptions = ({ t }: GetBestTimeOptions) => [
    {
        label: t('people.card.phone.bestTimes.morning'),
        value: 'Morning',
    },
    {
        label: t('people.card.phone.bestTimes.afternoon'),
        value: 'Afternoon',
    },
    {
        label: t('people.card.phone.bestTimes.evening'),
        value: 'Evening',
    },
    {
        label: t('people.card.phone.bestTimes.anytime'),
        value: 'Anytime',
    },
];

export const getPhoneTypeOptions = ({ t }: GetPhoneTypeOptions) => [
    {
        label: t('people.card.phone.phoneOptions.mobilePhone'),
        value: PhoneType.MOBILE,
    },
    {
        label: t('people.card.phone.phoneOptions.homePhone'),
        value: PhoneType.HOME,
    },
    {
        label: t('people.card.phone.phoneOptions.businessPhone'),
        value: PhoneType.BUSINESS,
    },
    { label: t('people.card.phone.phoneOptions.fax'), value: PhoneType.FAX },
];

export const getTimeZoneOptions = ({ t }: GetTimeZoneOptions) => [
    {
        //  blank values for deselecting options
        label: '\u200b',
        value: ' ',
    },
    {
        label: t(
            `people.sideSheet.phone.timeZoneOptions.${TimeZoneAbbreviations.akt}`,
            { abbreviation: TimeZoneAbbreviations.akt }
        ),
        value: TimeZoneAbbreviations.akt,
    },
    {
        label: t(
            `people.sideSheet.phone.timeZoneOptions.${TimeZoneAbbreviations.ct}`,
            { abbreviation: TimeZoneAbbreviations.ct }
        ),
        value: TimeZoneAbbreviations.ct,
    },
    {
        label: t(
            `people.sideSheet.phone.timeZoneOptions.${TimeZoneAbbreviations.et}`,
            { abbreviation: TimeZoneAbbreviations.et }
        ),
        value: TimeZoneAbbreviations.et,
    },
    {
        label: t(
            `people.sideSheet.phone.timeZoneOptions.${TimeZoneAbbreviations.ht}`,
            { abbreviation: TimeZoneAbbreviations.ht }
        ),
        value: TimeZoneAbbreviations.ht,
    },
    {
        label: t(
            `people.sideSheet.phone.timeZoneOptions.${TimeZoneAbbreviations.mt}`,
            { abbreviation: TimeZoneAbbreviations.mt }
        ),
        value: TimeZoneAbbreviations.mt,
    },
    {
        label: t(
            `people.sideSheet.phone.timeZoneOptions.${TimeZoneAbbreviations.pt}`,
            { abbreviation: TimeZoneAbbreviations.pt }
        ),
        value: TimeZoneAbbreviations.pt,
    },
];

export const getFormErrors = ({
    caseId,
    isDelete,
    phone,
    t,
}: GetFormErrors) => {
    let errors: Errors = {};

    const { areaCode, dialNumber, phoneType = PhoneType.HOME } = phone;
    const phoneNumber = `${areaCode}${dialNumber}`;
    const phoneRegex = /^\d{10}$/;

    if (caseId == null) {
        errors = {
            ...errors,
            caseId: `${t('people.sideSheet.phone.errors.missingCaseDocument')}`,
        };
    }

    if (isDelete) {
        return errors;
    }

    if (!areaCode) {
        errors = {
            ...errors,
            phoneNumber: t('people.sideSheet.phone.errors.isMissing', {
                phoneType: mapPhoneTypeToTranslation(phoneType, t),
            }) as string,
        };
    } else if (!phoneRegex.test(phoneNumber)) {
        errors = {
            ...errors,
            phoneNumber: t('people.sideSheet.phone.errors.isInvalid', {
                phoneType: mapPhoneTypeToTranslation(phoneType, t),
            }) as string,
        };
    }

    return errors;
};
