import { useTranslation } from 'next-i18next';

import FieldData from '@deps/components/fields/field-data/field-data';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import EmptyCard from '@deps/containers/people-data-cards/empty-card/empty-card';
import {
    getAdditionalActiveIdentifications,
    getMainActiveIdentifications,
} from '@deps/helpers/identification.helpers';
import AgentParty from '@deps/helpers/policy-sor/AgentParty';
import { PolicyParty } from '@deps/helpers/policy-sor/Parties';
import { getStateName } from '@deps/helpers/states.helpers';
import {
    convertKebabedDateString,
    formatSSN,
    safeString,
    toSentenceCase,
    trimStringByCharacterCount,
} from '@deps/helpers/string.helpers';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-small.svg';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { Identification, PartyType } from '@zinnia/api-types/types/sor';

export interface IdentificationCardProps {
    editable?: boolean;
    selectedPolicyParty?: PolicyParty | AgentParty;
    isAnnuity?: boolean;
}

const formatIdentificationValue = (identification: Identification): string => {
    switch (identification?.identificationType) {
        case Identification.identificationType.SSN:
        case Identification.identificationType.TIN:
            return formatSSN(identification?.identificationValue);
        default:
            return identification?.identificationValue || DEFAULT_ERROR_STRING;
    }
};

const showState = (identification: Identification): boolean => {
    return [
        Identification.identificationType.DRIVERLICENSENUMBER,
        Identification.identificationType.STATEPHOTOID,
        'DRIVERLICENSE' as Identification.identificationType,
    ].includes(
        identification?.identificationType ||
            ('' as Identification.identificationType)
    );
};

const showCountry = (identification: Identification): boolean => {
    return [Identification.identificationType.PASSPORT].includes(
        identification?.identificationType ||
            ('' as Identification.identificationType)
    );
};

const IdentificationDisplay = ({
    identification,
}: {
    identification: Identification;
}) => {
    const { t } = useTranslation();
    return (
        <FieldData
            label={t(
                `people.card.identification.types.${identification.identificationType}`,
                identification.identificationType || 'Unknown'
            )}
            sentenceCase={
                ![
                    Identification.identificationType.SSN,
                    Identification.identificationType.EXTERNAL,
                ].includes(
                    identification.identificationType as Identification.identificationType
                )
            }
        >
            <div className="flex flex-col">
                <PiiWrapper>
                    {formatIdentificationValue(identification)}
                </PiiWrapper>
                {showState(identification) && (
                    <PiiWrapper className="text-gray-600">
                        {getStateName(
                            identification?.issueState
                                ? String(identification?.issueState)
                                : undefined
                        )}
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
    const { t } = useTranslation();

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
        gender,
        genderIdentity,
    } = selectedPolicyParty ?? {};

    const isUSCitizenText = isUSCitizen
        ? t('people.card.identification.yes')
        : t('people.card.identification.no');

    const isOrganization = partyType === PartyType.ORGANIZATION;
    const isTrust = partyType === ('Trust' as PartyType);

    const isAgent = selectedPolicyParty instanceof AgentParty;
    const isIndividualParty = !isOrganization && !isTrust && !isAgent;

    const mainActiveIdentifications =
        getMainActiveIdentifications(identifications);
    const additionalActiveIdentifications =
        getAdditionalActiveIdentifications(identifications);

    return (
        <CardContainer classNames="flex w-full flex-col items-start">
            <div className="flex w-full flex-col items-start">
                <div className="flex w-full flex-col md:flex-row md:justify-between">
                    <div className="mb-4 flex flex-row items-center">
                        <Typography
                            variant={TypographyVariant.H2}
                            className="mr-5"
                        >
                            {t('people.card.identification.heading')}
                        </Typography>
                        {editable && (
                            <NavElement
                                type={NavElementType.Button}
                                size={NavElementSize.Small}
                                variant={NavElementVariant.Default}
                                startIcon={<AddIcon width={20} height={20} />}
                            >
                                {t('people.card.identification.add')}
                                {isTrust &&
                                    ` ${t(
                                        'people.card.identification.trustee'
                                    ).toLowerCase()}`}
                            </NavElement>
                        )}
                    </div>
                </div>

                {identifications?.length === 0 ? (
                    <EmptyCard text={t('people.card.identification.empty')} />
                ) : (
                    <div className="grid grid-cols-[repeat(2,minmax(min-content,max-content))] gap-x-8 gap-y-4 md:flex md:flex-wrap">
                        {isIndividualParty && gender && (
                            <FieldData label={t('allFields.sex')}>
                                {t(`allFields.${gender.toLowerCase()}`)}
                            </FieldData>
                        )}
                        {isIndividualParty && genderIdentity && (
                            <FieldData label={t('allFields.genderIdentity')}>
                                {trimStringByCharacterCount(
                                    toSentenceCase(genderIdentity),
                                    50
                                )}
                            </FieldData>
                        )}
                        {mainActiveIdentifications.map((identification) => (
                            <IdentificationDisplay
                                key={identification.identificationType}
                                identification={identification}
                            />
                        ))}
                        {isOrganization && (
                            <>
                                <FieldData
                                    label={t(
                                        'people.card.identification.options.orgCode'
                                    )}
                                    tooltipBody={t(
                                        'people.card.identification.options.orgCodeTooltip'
                                    )}
                                    tooltipTitle={t(
                                        'people.card.identification.options.orgCode'
                                    )}
                                >
                                    {safeString(organizationCode)}
                                </FieldData>
                                <FieldData
                                    label={t(
                                        'people.card.identification.options.entityType'
                                    )}
                                >
                                    {safeString(entityType)}
                                </FieldData>
                            </>
                        )}

                        {isTrust && (
                            <>
                                <FieldData
                                    label={t(
                                        'people.card.identification.options.trustDate'
                                    )}
                                >
                                    {convertKebabedDateString(trustDate)}
                                </FieldData>
                                <FieldData
                                    label={t(
                                        'people.card.identification.options.trustType'
                                    )}
                                >
                                    {safeString(trustType)}
                                </FieldData>
                                <FieldData
                                    editable
                                    label={t(
                                        'people.card.identification.trustee'
                                    )}
                                >
                                    <PiiWrapper>{fullName}</PiiWrapper>
                                </FieldData>
                            </>
                        )}
                        {isAnnuity && (
                            <>
                                <FieldData
                                    label={t(
                                        'people.card.identification.options.usCitizen'
                                    )}
                                    sentenceCase={false}
                                >
                                    {isUSCitizenText}
                                </FieldData>
                                {!isUSCitizen && (
                                    <FieldData
                                        label={t(
                                            'people.card.identification.options.citizenCountry'
                                        )}
                                    >
                                        {citizenCountry}
                                    </FieldData>
                                )}
                            </>
                        )}
                        {isAgent && (
                            <>
                                <FieldData
                                    label={t(
                                        'people.card.identification.types.EXTERNAL'
                                    )}
                                    sentenceCase={false}
                                >
                                    {selectedPolicyParty?.party.agentExternalId}
                                </FieldData>
                                <FieldData
                                    label={t(
                                        'people.card.identification.options.channel'
                                    )}
                                    sentenceCase={false}
                                >
                                    {selectedPolicyParty?.channel}
                                </FieldData>
                            </>
                        )}
                        {additionalActiveIdentifications.map(
                            (identification) => (
                                <IdentificationDisplay
                                    key={identification.identificationType}
                                    identification={identification}
                                />
                            )
                        )}
                    </div>
                )}
            </div>
        </CardContainer>
    );
};

export default IdentificationCard;
