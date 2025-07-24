import { Gender, PartyRole, PartyType } from '@zinnia/api-types/types/sor';
import { Tag, TagVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import Label, { LabelVariant } from '@deps/components/label/label';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useBeneChange } from '@deps/containers/bene-change/bene-change-provider';
import { FormattedAddress } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import { percentFormatify } from '@deps/helpers/numbers.helpers';
import {
    safeString,
    toTitleCase,
    isNullEmptyOrUndefined,
} from '@deps/helpers/string.helpers';

import {
    DEFAULT_BENE_ADDRESS,
    getTagVariant,
    isEqualObjects,
} from './summary-step.helpers';
import { getAddresses } from '../../beneficiary-details/address-details/address-details.helpers';
import {
    EnterprisePhone,
    formatPhoneNumberWithCountryCode,
    getPhones,
} from '../../beneficiary-details/phone-details/phone-details.helpers';

export interface FormattedEnterprisePhoneProps {
    phone: EnterprisePhone;
}

export const FormattedEnterprisePhone = ({
    phone,
}: FormattedEnterprisePhoneProps) => {
    return (
        <Typography className="truncate" variant={TypographyVariant.BodySm}>
            <PiiWrapper>{formatPhoneNumberWithCountryCode(phone)}</PiiWrapper>
        </Typography>
    );
};

const getGender = (gender: string) => {
    switch (gender) {
        case Gender.MALE:
            return 'Male';
        case Gender.FEMALE:
            return 'Female';
        default:
            return '-';
    }
};

const getFormattedAddress = (address: any) => {
    if (address?.country === 'USA') {
        address.country = 'US';
    }
    const isDefault = isEqualObjects(DEFAULT_BENE_ADDRESS, address);
    return isDefault ? {} : address;
};

const getFormattedPhone = (phone: any) => {
    if (phone.dialNumber) {
        return phone;
    } else {
        return {};
    }
};

const BeneficiarySummary = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.summary',
    });
    const { beneData, peopleSelection } = useBeneChange();

    const updatedBenes = useMemo(() => {
        return beneData?.filter(
            (item: any) => item.action === 'UPDATE' || item.action === 'ADD'
        );
    }, [beneData]);

    const currentData = peopleSelection?.cardActionData?.filteredData;

    return (
        <>
            {updatedBenes.map((item: any) => {
                const { tagVariant, tagText } = getTagVariant(item.action, t);
                const allocation =
                    item?.party?.allocation?.beneficiaryPercentage ?? 0;
                const existingParty = currentData?.find(
                    (element: any) =>
                        element.partyId === item?.partyRole?.partyId
                );
                const { phones, addresses, partyType } = existingParty ?? {};
                const currentAddresses: any[] = getAddresses({ addresses });
                const currentPhones: EnterprisePhone[] = getPhones({ phones });
                const {
                    firstName,
                    middleName,
                    lastName,
                    gender,
                    partyType: partyTypeInfo,
                } = item.party.info;
                const updatedAddress = item?.party?.addresses?.[0]
                    ? getFormattedAddress(item?.party?.addresses?.[0])
                    : {};
                const updatedPhone = item?.party?.phones?.[0]
                    ? getFormattedPhone(item.party?.phones?.[0])
                    : {};
                const currAddress = {
                    ...currentAddresses?.[0],
                    country:
                        currentAddresses?.[0]?.country === 'USA'
                            ? 'US'
                            : currentAddresses?.[0]?.country,
                };

                const selectedPartyType = !isNullEmptyOrUndefined(partyTypeInfo)
                    ? partyTypeInfo
                    : partyType;

                const name =
                    selectedPartyType === PartyType.INDIVIDUAL
                        ? toTitleCase(
                              [firstName, middleName, lastName]
                                  .filter(Boolean)
                                  .join(' ')
                          )
                        : toTitleCase(lastName);

                return (
                    <div
                        className="my-4 w-full rounded-sm border-2 border-gray-100 p-8"
                        key={item.index}
                    >
                        <div className="mb-5">
                            <div className="flex">
                                <Typography variant={TypographyVariant.H2}>
                                    {name}
                                </Typography>
                                <Tag
                                    text={tagText}
                                    className="m-1 mx-3 h-6"
                                    variant={tagVariant as TagVariant}
                                />
                            </div>
                            <Tag
                                text={
                                    item.partyRole.partyRole ===
                                    PartyRole.PRIMARYBENEFICIARY
                                        ? t('primaryBeneficiary')
                                        : t('contingentBeneficiary')
                                }
                                className="my-3"
                            />
                        </div>

                        <div className="mb-6">
                            <Typography variant={TypographyVariant.H2}>
                                {t('identification.title')}
                            </Typography>
                            <Label
                                className="mt-4 h-6 leading-4.5"
                                label={'Gender'}
                                variant={LabelVariant.FieldLabel}
                            />
                            <p className="mb-5">{getGender(gender)}</p>
                            <div className="w-[800px] border border-b-2 border-gray-100"></div>
                        </div>

                        <div className="mb-6">
                            <Typography variant={TypographyVariant.H2}>
                                {t('allocation.title')}
                            </Typography>
                            <div className="my-4 flex">
                                <div>
                                    <Label
                                        variant={LabelVariant.FieldLabel}
                                        label={t('allocation.title')}
                                    />
                                    <Typography
                                        variant={TypographyVariant.BodySm}
                                    >
                                        {percentFormatify(allocation, {
                                            isInteger: true,
                                        })}
                                    </Typography>
                                </div>
                                <div className="mx-4">
                                    <Label
                                        variant={LabelVariant.FieldLabel}
                                        label={t(
                                            'allocation.relationshipToParty'
                                        )}
                                    />
                                    <Typography
                                        variant={TypographyVariant.BodySm}
                                    >
                                        {safeString(
                                            item?.party?.allocation
                                                ?.relationshipToParty
                                        )}
                                    </Typography>
                                </div>
                            </div>
                            <div className="w-[1020px] border border-b-2 border-gray-100"></div>
                        </div>

                        <div className="mb-5">
                            <Typography variant={TypographyVariant.H2}>
                                {t('contact.title')}
                            </Typography>
                            {item.action === 'UPDATE' && (
                                <div className="my-4 flex">
                                    <div className="mx-2">
                                        <div className="flex">
                                            <Label
                                                className="h-6 leading-4.5"
                                                label={t('contact.address')}
                                                variant={
                                                    LabelVariant.FieldLabel
                                                }
                                            />
                                            <div className="ml-3 h-2 w-[250px] border-b-2 border-gray-100"></div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="bg-gray-50 p-3">
                                                <Tag
                                                    text={t('current')}
                                                    className="my-1"
                                                />
                                                <FormattedAddress
                                                    address={currAddress ?? {}}
                                                />
                                            </div>
                                            <div className="flex flex-col p-3">
                                                <Tag
                                                    text={t('updated')}
                                                    className="my-1"
                                                    variant={
                                                        TagVariant.Information
                                                    }
                                                />
                                                <FormattedAddress
                                                    address={updatedAddress}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mx-2">
                                        <div className="flex">
                                            <Label
                                                className="h-6 leading-4.5"
                                                label={t('contact.phone')}
                                                variant={
                                                    LabelVariant.FieldLabel
                                                }
                                            />
                                            <div className="ml-3 h-2 w-[250px] border-b-2 border-gray-100"></div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="bg-gray-50 p-3">
                                                <Tag
                                                    text={t('current')}
                                                    className="my-1"
                                                />
                                                <FormattedEnterprisePhone
                                                    phone={
                                                        currentPhones?.[0] ?? {}
                                                    }
                                                />
                                            </div>
                                            <div className="flex flex-col p-3">
                                                <Tag
                                                    text={t('updated')}
                                                    className="my-1"
                                                    variant={
                                                        TagVariant.Information
                                                    }
                                                />
                                                <FormattedEnterprisePhone
                                                    phone={updatedPhone}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {item.action === 'ADD' && (
                                <div className="my-4 flex">
                                    <div className="flex gap-4">
                                        <div className="mx-2">
                                            <div className="flex">
                                                <Label
                                                    className="h-6 leading-4.5"
                                                    label={t('contact.address')}
                                                    variant={
                                                        LabelVariant.FieldLabel
                                                    }
                                                />
                                            </div>
                                            <FormattedAddress
                                                address={updatedAddress}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="mx-2">
                                            <div className="flex">
                                                <Label
                                                    className="h-6 leading-4.5"
                                                    label={t('contact.phone')}
                                                    variant={
                                                        LabelVariant.FieldLabel
                                                    }
                                                />
                                            </div>
                                            <FormattedEnterprisePhone
                                                phone={updatedPhone}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </>
    );
};
export default BeneficiarySummary;
