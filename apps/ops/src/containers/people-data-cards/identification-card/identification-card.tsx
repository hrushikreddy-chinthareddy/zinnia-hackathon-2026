import {
    Identification,
    IdentificationType,
    PartyType,
} from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import FieldData from '@deps/components/fields/field-data/field-data';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Toggle, {
    ToggleSize,
    ToggleVariant,
} from '@deps/components/toggle/toggle';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import EmptyCard from '@deps/containers/people-data-cards/empty-card/empty-card';
import AgentParty from '@deps/helpers/policy-sor/AgentParty';
import { PolicyParty } from '@deps/helpers/policy-sor/Parties';
import { getStateName } from '@deps/helpers/states.helpers';
import {
    convertKebabedDateString,
    formatSSN,
    safeString,
} from '@deps/helpers/string.helpers';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-small.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

export interface IdentificationCardProps {
    editable?: boolean;
    selectedPolicyParty?: PolicyParty | AgentParty;
    isAnnuity?: boolean;
}

// The ID Types that are displayed in the main section of the card
const MAIN_IDENTIFICATION_TYPES = [
    IdentificationType.SSN,
    IdentificationType.TIN,
    IdentificationType.EXTERNAL,
    IdentificationType.OTHER,
];

const formatIdentificationValue = (identification: Identification): string => {
    switch (identification?.identificationType) {
        case IdentificationType.SSN:
        case IdentificationType.TIN:
            return formatSSN(identification?.identificationValue);
        default:
            return identification?.identificationValue || DEFAULT_ERROR_STRING;
    }
};

const showState = (identification: Identification): boolean => {
    return [
        IdentificationType.DRIVERLICENSENUMBER,
        IdentificationType.STATEPHOTOID,
        'DRIVERLICENSE' as IdentificationType,
    ].includes(
        identification?.identificationType || ('' as IdentificationType)
    );
};

const showCountry = (identification: Identification): boolean => {
    return [IdentificationType.PASSPORT].includes(
        identification?.identificationType || ('' as IdentificationType)
    );
};

const IdentificationDisplay = ({
    identification,
}: {
    identification: Identification;
}) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.card.identification.types',
    });
    return (
        <FieldData
            label={t(
                `${identification.identificationType}`,
                identification.identificationType || 'Unknown'
            )}
            sentenceCase={
                ![IdentificationType.SSN, IdentificationType.EXTERNAL].includes(
                    identification.identificationType as IdentificationType
                )
            }
        >
            <div className="flex flex-col">
                <PiiWrapper>
                    {formatIdentificationValue(identification)}
                </PiiWrapper>
                {showState(identification) && (
                    <PiiWrapper className="text-gray-600">
                        {getStateName(identification?.issueState)}
                    </PiiWrapper>
                )}
                {showCountry(identification) && (
                    <PiiWrapper className="text-gray-600">
                        {identification?.issueCountry}
                    </PiiWrapper>
                )}
                {identification?.identificationKey && (
                    <PiiWrapper className="text-gray-600">
                        {identification?.identificationKey}
                    </PiiWrapper>
                )}
            </div>
        </FieldData>
    );
};

const IdentificationCard = ({
    editable = false,
    selectedPolicyParty,
    isAnnuity,
}: IdentificationCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.card.identification',
    });

    const {
        entityType,
        organizationCode,
        partyType,
        trustDate,
        trustType,
        identifications,
        citizenCountry,
        isUSCitizen,
        fullName,
    } = selectedPolicyParty ?? {};

    const [showAdditional, setShowAdditional] = useState(false);

    const isUSCitizenText = isUSCitizen ? t('yes') : t('no');

    const isOrganization = partyType === PartyType.ORGANIZATION;
    const isTrust = partyType === ('Trust' as PartyType);

    const isAgent = selectedPolicyParty instanceof AgentParty;

    const mainIdentifications =
        identifications?.filter((identification) =>
            MAIN_IDENTIFICATION_TYPES.includes(
                identification?.identificationType ?? ('' as IdentificationType)
            )
        ) ?? [];
    const additionalIdentifications =
        identifications?.filter(
            (identification) =>
                !MAIN_IDENTIFICATION_TYPES.includes(
                    identification?.identificationType ??
                        ('' as IdentificationType)
                )
        ) ?? [];

    return (
        <CardContainer classNames="flex w-full flex-col items-start">
            <div className="flex w-full flex-col items-start">
                <div className="flex w-full flex-col md:flex-row md:justify-between">
                    <div className="mb-4 flex flex-row items-center">
                        <Typography
                            variant={TypographyVariant.H2}
                            className="mr-5"
                        >
                            {t('heading')}
                        </Typography>
                        {editable && (
                            <NavElement
                                type={NavElementType.Button}
                                size={NavElementSize.Small}
                                variant={NavElementVariant.Default}
                                startIcon={<AddIcon width={20} height={20} />}
                            >
                                {t('add')}
                                {isTrust && ` ${t('trustee').toLowerCase()}`}
                            </NavElement>
                        )}
                    </div>
                    {!!identifications?.length && (
                        <div className="mb-5 flex flex-row items-center">
                            <Toggle
                                size={ToggleSize.Default}
                                variant={
                                    additionalIdentifications?.length
                                        ? ToggleVariant.Default
                                        : ToggleVariant.Inactive
                                }
                                text={t('showAdditional') as string}
                                ariaLabel={t('showAdditional') as string}
                                value={showAdditional}
                                handleToggle={setShowAdditional}
                            />
                        </div>
                    )}
                </div>

                {identifications?.length === 0 ? (
                    <EmptyCard text={t('empty')} />
                ) : (
                    <div className="grid grid-cols-[repeat(2,minmax(min-content,max-content))] gap-x-8 gap-y-4 md:flex md:flex-wrap">
                        {mainIdentifications.map((identification) => (
                            <IdentificationDisplay
                                key={identification.identificationType}
                                identification={identification}
                            />
                        ))}
                        {isOrganization && (
                            <>
                                <FieldData
                                    label={t('options.orgCode')}
                                    tooltipBody={t('options.orgCodeTooltip')}
                                    tooltipTitle={t('options.orgCode')}
                                >
                                    {safeString(organizationCode)}
                                </FieldData>
                                <FieldData label={t('options.entityType')}>
                                    {safeString(entityType)}
                                </FieldData>
                            </>
                        )}

                        {isTrust && (
                            <>
                                <FieldData label={t('options.trustDate')}>
                                    {convertKebabedDateString(trustDate)}
                                </FieldData>
                                <FieldData label={t('options.trustType')}>
                                    {safeString(trustType)}
                                </FieldData>
                                <FieldData editable label={t('trustee')}>
                                    <PiiWrapper>{fullName}</PiiWrapper>
                                </FieldData>
                            </>
                        )}
                        {isAnnuity && (
                            <>
                                <FieldData
                                    label={t('options.usCitizen')}
                                    sentenceCase={false}
                                >
                                    {isUSCitizenText}
                                </FieldData>
                                {!isUSCitizen && (
                                    <FieldData
                                        label={t('options.citizenCountry')}
                                    >
                                        {citizenCountry}
                                    </FieldData>
                                )}
                            </>
                        )}
                        {isAgent && (
                            <>
                                <FieldData
                                    label={t('types.EXTERNAL')}
                                    sentenceCase={false}
                                >
                                    {selectedPolicyParty?.party.agentExternalId}
                                </FieldData>
                                <FieldData
                                    label={t('options.channel')}
                                    sentenceCase={false}
                                >
                                    {selectedPolicyParty?.channel}
                                </FieldData>
                            </>
                        )}
                        {showAdditional &&
                            additionalIdentifications.map((identification) => (
                                <IdentificationDisplay
                                    key={identification.identificationType}
                                    identification={identification}
                                />
                            ))}
                    </div>
                )}
            </div>
        </CardContainer>
    );
};

export default IdentificationCard;
