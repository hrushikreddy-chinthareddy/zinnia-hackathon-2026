import {
    Gender,
    IdentificationType,
    PartyRole,
    PartyType,
    Policy,
} from '@zinnia/api-types/types/sor';
import { Tag, TagVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import Label, { LabelVariant } from '@deps/components/label/label';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import {
    Action,
    BooleanValue,
    EntityTypeValue,
    NewTrustType,
} from '@deps/constants/policy';
import { useBeneChange } from '@deps/containers/bene-change/bene-change-provider';
import { FormattedAddress } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import {
    getTrustTypeLabel,
    getEntityTypeLabel,
} from '@deps/containers/role-change/role-change-helper';
import { ExtendedParty } from '@deps/contexts/BeneChangeContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import { percentFormatify } from '@deps/helpers/numbers.helpers';
import { areObjectsDifferent } from '@deps/helpers/objects.helpers';
import {
    safeString,
    toTitleCase,
    isNullEmptyOrUndefined,
} from '@deps/helpers/string.helpers';

import {
    DEFAULT_BENE_ADDRESS,
    getTagVariant,
    hasBeneficiaryChanged,
    isEqualObjects,
} from './summary-step.helpers';
import { getAddresses } from '../../beneficiary-details/address-details/address-details.helpers';
import { TrustType } from '../../beneficiary-details/bene-identification/bene-identification.helpers';
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

export const FormattedEmail = ({ email }: { email: string }) => {
    return (
        <Typography className="truncate" variant={TypographyVariant.BodySm}>
            <PiiWrapper>{email}</PiiWrapper>
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

export const getFormattedAddress = (address: any) => {
    if (address?.country === 'USA') {
        address.country = 'US';
    }
    const isDefault = isEqualObjects(DEFAULT_BENE_ADDRESS, address);
    return isDefault ? {} : address;
};

export const getFormattedPhone = (phone: any) => {
    if (phone.dialNumber) {
        return phone;
    } else {
        return {};
    }
};

export const getEmails = ({ emails }: any): any[] => {
    if (!emails) return [];
    return emails?.filter((email: any) => !isEndDated(email.endDate)) ?? [];
};

const ComparisonSection = ({
    label,
    currentTag,
    updatedTag,
    currentData,
    updatedData,
    FormattedComponent,
}: {
    label: string;
    currentTag: string;
    updatedTag: string;
    currentData: any;
    updatedData: any;
    FormattedComponent?: React.FC<any>;
}) => (
    <div className="mx-2">
        <div className="flex">
            <Label
                className="h-6 leading-4.5"
                label={label}
                variant={LabelVariant.FieldLabel}
            />
        </div>
        <div className="flex gap-4">
            <div className="bg-gray-50 p-3">
                <Tag text={currentTag} className="my-1" />
                {FormattedComponent ? (
                    <FormattedComponent {...currentData} />
                ) : (
                    <div>{currentData}</div>
                )}
            </div>
            <div className="flex flex-col p-3">
                <Tag
                    text={updatedTag}
                    className="my-1"
                    variant={TagVariant.Information}
                />
                {FormattedComponent ? (
                    <FormattedComponent {...updatedData} />
                ) : (
                    <div>{updatedData}</div>
                )}
            </div>
        </div>
    </div>
);

const ContactField = ({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) => (
    <div className="flex gap-4">
        <div className="mx-2">
            <div className="flex">
                <Label
                    className="h-6 leading-4.5"
                    label={label}
                    variant={LabelVariant.FieldLabel}
                />
            </div>
            {children}
        </div>
    </div>
);

const BeneficiarySummary = ({ policy }: { policy: Policy }) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.summary',
    });
    const { beneData, peopleSelection } = useBeneChange();

    const { t: t2 } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.beneDetails.identification',
    });

    const updatedBenes = useMemo(() => {
        return beneData?.filter(
            (item: any) =>
                item.action === Action.UPDATE || item.action == Action.ADD
        );
    }, [beneData]);

    const currentData = peopleSelection?.cardActionData?.filteredData;

    const hasChanged = (currentValue: string, updatedValue: string) => {
        return currentValue !== updatedValue;
    };

    const shouldDisplayField = (
        currentValue: string | undefined,
        updatedValue: string | undefined,
        action: string
    ) => {
        return (
            action === Action.ADD ||
            hasChanged(currentValue ?? '', updatedValue ?? '')
        );
    };

    const renderFieldDynamically = (
        label: string,
        currentValue: string,
        updatedValue: string,
        action: string,
        renderValue: (value: any) => React.ReactNode = (value) => value
    ) => {
        if (shouldDisplayField(currentValue, updatedValue, action)) {
            return (
                <div className="mx-4 my-3">
                    <Label
                        className="h-6 leading-4.5"
                        label={label}
                        variant={LabelVariant.FieldLabel}
                    />
                    <p className="mb-5">{updatedValue}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            {updatedBenes.map((item: any) => {
                const hasActualChanges =
                    item.action === Action.ADD ||
                    (item.action === Action.UPDATE &&
                        hasBeneficiaryChanged(item, currentData, policy));

                if (!hasActualChanges) {
                    return;
                }

                const { tagVariant, tagText } = getTagVariant(item.action, t);
                const action = item.action;
                const allocation =
                    item?.party?.allocation?.beneficiaryPercentage ?? 0;

                const existingParty = currentData?.find(
                    (element: any) =>
                        element.partyId === item?.partyRole?.partyId
                );

                const partyId = item?.partyRole?.partyId;
                const relationshipToParty =
                    partyId &&
                    policy?.partyRoles?.find(
                        (role) => role?.partyId === partyId
                    )?.relationshipToParty;

                const {
                    phones,
                    addresses,
                    emails,
                    partyType,
                    dateOfBirth: existingDateOfBirth,
                    gender: existingGender,
                    identifications: existingIdentifications,
                    beneficiaryPercentage: existingBeneficiaryPercentage,
                    isIrrevocable: existingIsIrrevocable,
                    isPerStirpes: existingIsPerStirpes,
                    trustType: existingTrustType,
                    entityType: existingEntityType,
                } = (existingParty as ExtendedParty) ?? {};

                const currentAddresses: any[] = getAddresses({ addresses });
                const currentPhones: EnterprisePhone[] = getPhones({ phones });
                const currentEmail = emails?.[0]?.emailAddress || '';

                const ssnIdentification = (existingIdentifications ?? []).find(
                    (id: any) =>
                        id.identificationType === IdentificationType.SSN
                ) as any;

                const { isPerStirpes, isIrrevocable } = item?.beneInfo || {};

                const {
                    firstName,
                    middleName,
                    lastName,
                    gender,
                    partyType: partyTypeInfo,
                    ssn,
                    dateOfBirth,
                    trustType,
                    trustDate,
                    entityType,
                } = item.party.info;

                const updatedAddress = item?.party?.addresses?.[0]
                    ? getFormattedAddress(item?.party?.addresses?.[0])
                    : {};
                const updatedPhone = item?.party?.phones?.[0]
                    ? getFormattedPhone(item.party?.phones?.[0])
                    : {};

                const updatedEmail =
                    item?.party?.emails?.[0]?.emailAddress || '';

                const identificationFieldsChanged =
                    (partyTypeInfo === PartyType.TRUST &&
                        shouldDisplayField(
                            existingTrustType,
                            trustType,
                            action
                        )) ||
                    shouldDisplayField(
                        ssnIdentification?.identificationValue,
                        ssn,
                        action
                    ) ||
                    (partyTypeInfo === PartyType.TRUST &&
                        shouldDisplayField(
                            trustDate,
                            trustDate,
                            item.action
                        )) ||
                    (partyTypeInfo === PartyType.ORGANIZATION &&
                        shouldDisplayField(
                            existingEntityType,
                            entityType,
                            item.action
                        ));

                const allocationFieldsChanged =
                    shouldDisplayField(
                        existingBeneficiaryPercentage as unknown as string,
                        allocation,
                        item.action
                    ) ||
                    shouldDisplayField(
                        relationshipToParty,
                        item?.party?.allocation?.relationshipToParty,
                        item.action
                    );

                const currAddress = getFormattedAddress({
                    ...currentAddresses?.[0],
                    country:
                        currentAddresses?.[0]?.country === 'USA'
                            ? 'US'
                            : currentAddresses?.[0]?.country,
                });

                const currentPhone = getFormattedPhone(
                    currentPhones?.[0] ?? {}
                );

                const addressChanged = areObjectsDifferent(
                    currAddress ?? {},
                    updatedAddress ?? {}
                );
                const phoneChanged = areObjectsDifferent(
                    currentPhone,
                    updatedPhone ?? {}
                );
                const emailChanged = updatedEmail != currentEmail;

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

                const contactFieldsChanged =
                    addressChanged || phoneChanged || emailChanged;

                const isPartyIndividual =
                    selectedPartyType === PartyType.INDIVIDUAL;
                const isPartyTrust = selectedPartyType === PartyType.TRUST;
                const isPartyOrganization =
                    selectedPartyType === PartyType.ORGANIZATION;

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
                        {identificationFieldsChanged && (
                            <div className="mb-6">
                                <Typography variant={TypographyVariant.H2}>
                                    {t('identification.title')}
                                </Typography>

                                <div className="my-4 flex">
                                    {isPartyTrust &&
                                        renderFieldDynamically(
                                            t2('trustType'),
                                            getTrustTypeLabel(
                                                existingTrustType as unknown as NewTrustType,
                                                t2,
                                                ''
                                            ),
                                            getTrustTypeLabel(
                                                trustType ??
                                                    TrustType.Individual,
                                                t2,
                                                ''
                                            ),
                                            action
                                        )}
                                    {isPartyOrganization &&
                                        renderFieldDynamically(
                                            t2('entityType'),
                                            getEntityTypeLabel(
                                                existingEntityType as unknown as EntityTypeValue,
                                                t2,
                                                ''
                                            ),
                                            getEntityTypeLabel(
                                                entityType ??
                                                    EntityTypeValue.Other,
                                                t2,
                                                ''
                                            ),
                                            action
                                        )}
                                    {isPartyIndividual &&
                                        renderFieldDynamically(
                                            t('identification.gender'),
                                            getGender(existingGender as string),
                                            getGender(gender),
                                            action
                                        )}
                                    {renderFieldDynamically(
                                        t('identification.ssn'),
                                        ssnIdentification?.identificationValue,
                                        ssn,
                                        action
                                    )}
                                    {isPartyIndividual &&
                                        renderFieldDynamically(
                                            t('identification.dateOfBirth'),
                                            existingDateOfBirth as string,
                                            dateOfBirth,
                                            item.action
                                        )}
                                    {isPartyTrust &&
                                        renderFieldDynamically(
                                            t('identification.trustDate'),
                                            trustDate as string,
                                            item?.party?.info?.trustDate,
                                            item.action
                                        )}
                                </div>
                                <div className="w-[800px] border border-b-2 border-gray-100"></div>
                            </div>
                        )}

                        {allocationFieldsChanged && (
                            <div className="mb-6">
                                <Typography variant={TypographyVariant.H2}>
                                    {t('allocation.title')}
                                </Typography>
                                <div className="my-4 flex">
                                    {renderFieldDynamically(
                                        t('allocation.title'),
                                        percentFormatify(
                                            existingBeneficiaryPercentage,
                                            { isInteger: true }
                                        ),
                                        percentFormatify(allocation, {
                                            isInteger: true,
                                        }),
                                        item.action
                                    )}
                                    {renderFieldDynamically(
                                        t('allocation.relationshipToParty'),
                                        relationshipToParty,
                                        item?.party?.allocation
                                            ?.relationshipToParty,
                                        item.action,
                                        safeString
                                    )}
                                </div>
                                <div className="w-[1020px] border border-b-2 border-gray-100"></div>
                            </div>
                        )}

                        {contactFieldsChanged && (
                            <div className="mb-5">
                                <Typography variant={TypographyVariant.H2}>
                                    {t('contact.title')}
                                </Typography>
                                {item.action === Action.UPDATE && (
                                    <div className="my-4 flex">
                                        {addressChanged && (
                                            <ComparisonSection
                                                label={t('contact.address')}
                                                currentData={{
                                                    address: currAddress ?? {},
                                                }}
                                                updatedData={{
                                                    address:
                                                        updatedAddress ?? {},
                                                }}
                                                FormattedComponent={
                                                    FormattedAddress
                                                }
                                                currentTag={t('current')}
                                                updatedTag={t('updated')}
                                            />
                                        )}
                                        {phoneChanged && (
                                            <ComparisonSection
                                                label={t('contact.phone')}
                                                currentData={{
                                                    phone: currentPhone,
                                                }}
                                                updatedData={{
                                                    phone: updatedPhone ?? {},
                                                }}
                                                FormattedComponent={
                                                    FormattedEnterprisePhone
                                                }
                                                currentTag={t('current')}
                                                updatedTag={t('updated')}
                                            />
                                        )}
                                        {emailChanged && (
                                            <ComparisonSection
                                                label={t('contact.email')}
                                                currentData={currentEmail}
                                                updatedData={updatedEmail}
                                                currentTag={t('current')}
                                                updatedTag={t('updated')}
                                            />
                                        )}
                                    </div>
                                )}
                                {item.action === Action.ADD && (
                                    <div className="my-4 flex">
                                        <ContactField
                                            label={t('contact.address')}
                                        >
                                            <FormattedAddress
                                                address={updatedAddress}
                                            />
                                        </ContactField>

                                        <ContactField
                                            label={t('contact.phone')}
                                        >
                                            <FormattedEnterprisePhone
                                                phone={updatedPhone}
                                            />
                                        </ContactField>

                                        <ContactField
                                            label={t('contact.email')}
                                        >
                                            <Typography
                                                variant={
                                                    TypographyVariant.BodySm
                                                }
                                            >
                                                {updatedEmail}
                                            </Typography>
                                        </ContactField>
                                    </div>
                                )}

                                <div className="w-[1020px] border border-b-2 border-gray-100"></div>
                            </div>
                        )}

                        <div className="mb-6">
                            <div className="my-4 flex">
                                {renderFieldDynamically(
                                    t('beneficiaryInformation.perStirpes'),
                                    existingIsPerStirpes == true
                                        ? BooleanValue.Yes
                                        : BooleanValue.No,
                                    isPerStirpes === true
                                        ? BooleanValue.Yes
                                        : BooleanValue.No,
                                    action
                                )}
                                {renderFieldDynamically(
                                    t('beneficiaryInformation.irrevocable'),
                                    existingIsIrrevocable == true
                                        ? BooleanValue.Yes
                                        : BooleanValue.No,
                                    isIrrevocable === true
                                        ? BooleanValue.Yes
                                        : BooleanValue.No,
                                    action
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </>
    );
};
export default BeneficiarySummary;
