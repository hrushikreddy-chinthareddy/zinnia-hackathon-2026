import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import FieldData from '@deps/components/fields/field-data/field-data';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Toggle, { ToggleSize, ToggleVariant } from '@deps/components/toggle/toggle';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import EmptyCard from '@deps/containers/people-data-cards/empty-card/empty-card';
import { getFullName } from '@deps/helpers/party-info-helper';
import { getStateName } from '@deps/helpers/states.helper';
import { convertKebabedDateString, formatSSN, safeString } from '@deps/helpers/string.helper';
import { IdentificationType, PartyType, PolicyAllOfPartiesItem } from '@deps/models/policy/sor-policy';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-small.svg';
import { ReactComponent as FingerprintIcon } from '@deps/styles/elements/icons/icons_outlined/fingerprint.svg';

 export interface IdentificationCardProps {
    editable?: boolean;
    selectedPolicyParty?: PolicyAllOfPartiesItem;
}

const IdentificationCard = ({ editable = false, selectedPolicyParty }: IdentificationCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'people.card.identification' });

    const { entityType, identifications, organizationCode, partyType, trustDate, trustType } = selectedPolicyParty ?? {};

    const [showAdditional, setShowAdditional] = useState(false);

    const driversLicense = identifications?.find(
        identification => identification.identificationType === ('DRIVERLICENSE' as IdentificationType)
    );
    const passports = identifications?.filter(identification => identification.identificationType === IdentificationType.PASSPORT);
    const socialSecurity = identifications?.find(identification => identification.identificationType === IdentificationType.SSN);
    const stateId = identifications?.find(identification => identification.identificationType === IdentificationType.STATEPHOTOID);
    const taxId = identifications?.find(identification => identification.identificationType === IdentificationType.TIN);

    const isIndividual = partyType === PartyType.INDIVIDUAL;
    const isOrganization = partyType === PartyType.ORGANIZATION;
    const isTrust = partyType === ('Trust' as PartyType);

    const hasAdditional = driversLicense || stateId || passports?.length;

    return (
        <CardContainer classNames="flex w-full flex-col items-start">
            <div className="flex w-full flex-col items-start">
                <div className="flex w-full flex-col md:flex-row md:justify-between">
                    <div className="mb-4 flex flex-row items-center">
                        <FingerprintIcon role= "presentation" width={24} height={24} className="mr-2 text-primary" />
                        <Typography variant={TypographyVariant.H2} className="mr-5">
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
                    {isIndividual && !!identifications?.length && (
                        <div className="mb-5 flex flex-row items-center">
                            <Toggle
                                size={ToggleSize.Default}
                                variant={hasAdditional ? ToggleVariant.Default : ToggleVariant.Inactive}
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
                    <div className="grid grid-cols-[repeat(2,minmax(min-content,max-content))] gap-x-8 gap-y-4 md:flex md:flex-wrap lg:ml-8">
                        {isIndividual && (
                            <>
                                <FieldData label={t('options.socialSecurity')} sentenceCase={false}>
                                    <PiiWrapper>{formatSSN(socialSecurity?.identificationValue)}</PiiWrapper>
                                </FieldData>
                                {showAdditional && (
                                    <>
                                        {driversLicense && (
                                            <FieldData label={t('options.driversLicense')}>
                                                <div className="flex flex-col">
                                                    <PiiWrapper>{driversLicense.identificationValue}</PiiWrapper>
                                                    <PiiWrapper>{getStateName(driversLicense.issueState)}</PiiWrapper>
                                                </div>
                                            </FieldData>
                                        )}
                                        {stateId && !driversLicense && (
                                            <FieldData label={t('options.stateId')}>
                                                <div className="flex flex-col">
                                                    <span>{stateId.identificationValue}</span>
                                                    <span>{getStateName(stateId.issueState)}</span>
                                                </div>
                                            </FieldData>
                                        )}
                                        {!!passports?.length &&
                                            passports.map(passport => (
                                                <FieldData key={passport.identificationValue} label={t('options.passport')}>
                                                    <div className="flex flex-col">
                                                        <PiiWrapper>{passport.identificationValue}</PiiWrapper>
                                                        <PiiWrapper>{passport.issueCountry}</PiiWrapper>
                                                    </div>
                                                </FieldData>
                                            ))}
                                    </>
                                )}
                            </>
                        )}

                        {(isOrganization || isTrust) && (
                            <FieldData label={t('options.taxId')} sentenceCase={false}>
                                <PiiWrapper>{formatSSN(formatSSN(taxId?.identificationValue))}</PiiWrapper>
                            </FieldData>
                        )}

                        {isOrganization && (
                            <>
                                <FieldData
                                    label={t('options.orgCode')}
                                    tooltipBody={t('options.orgCodeTooltip')}
                                    tooltipTitle={t('options.orgCode')}
                                >
                                    {safeString(organizationCode)}
                                </FieldData>
                                <FieldData label={t('options.entityType')}>{safeString(entityType)}</FieldData>
                            </>
                        )}

                        {isTrust && (
                            <>
                                <FieldData label={t('options.trustDate')}>{convertKebabedDateString(trustDate)}</FieldData>
                                <FieldData label={t('options.trustType')}>{safeString(trustType)}</FieldData>
                                <FieldData editable label={t('trustee')}>
                                    <PiiWrapper>{getFullName(selectedPolicyParty)}</PiiWrapper>
                                </FieldData>
                            </>
                        )}
                    </div>
                )}
            </div>
        </CardContainer>
    );
};

export default IdentificationCard;
