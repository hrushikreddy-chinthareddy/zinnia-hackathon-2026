import {
    TagVariant,
    AssistiveText,
    AssistiveTextVariant,
    Tag,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';

import BannerAlert, {
    BannerVariant,
} from '@deps/components/banner-alert/banner-alert';
import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Label, { LabelVariant } from '@deps/components/label/label';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { Links, PolicyRole, Roles, TagType } from '@deps/constants/policy';
import { getRelationshipLabel } from '@deps/constants/role';
import { FormattedEnterprisePhone } from '@deps/containers/bene-change/components/steps/summary/beneficiary-summary';
import { getTagVariant } from '@deps/containers/bene-change/components/steps/summary/summary-step.helpers';
import { FormattedAddress } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import { useRoleChange } from '@deps/contexts/RoleChangeContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { toTitleCase } from '@deps/helpers/string.helpers';
import {
    TransactionResponseStatus,
    ValidationResult,
} from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { PartyType, Policy } from '@zinnia/api-types/types/sor';

import {
    filterNotRemoved,
    getContactLabel,
    getTrustTypeLabel,
    formatDate,
    rolePartyCheck,
    roleCheck,
} from '../../role-change-helper';

interface SummaryStepProps {
    policy: Policy;
    role: PolicyRole;
    roleLabel: string;
    leaveTransactionLink: string;
}

const SummaryStep = ({
    policy,
    role,
    roleLabel,
    leaveTransactionLink,
}: SummaryStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'roleChange.summary',
    });
    const { t: t2 } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'roleChange.roleDetails',
    });

    const { t: t3 } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.beneDetails.identification',
    });

    const { goToNext } = useWorkflow();

    const { tagVariant, tagText } = getTagVariant(TagType.Add, t);
    const { tagVariant: existingTagVariant, tagText: existingTagText } =
        getTagVariant(
            role.toUpperCase() === Roles.THIRDPARTYDESIGNEE
                ? ''
                : TagType.Delete,
            t
        );

    const { roleData, existingRoleData } = useRoleChange();

    const [showSelectionError, setShowSelectionError] =
        useState<boolean>(false);
    const [isChecked, setIsChecked] = useState<boolean>(false);

    const {
        party,
        changeReason,
        relationshipToParty,
        supportingDocumentAttached,
        validationResponse,
    } = roleData;

    const existingParty = existingRoleData?.[0]?.party;

    const {
        firstName,
        middleName,
        lastName,
        gender,
        dateOfBirth,
        addresses,
        phones,
        emails,
        partyType,
        identifications,
        preferredCommunicationType,
        trustType,
        trustDate,
    } = party || {};

    const {
        firstName: existingFirstName,
        middleName: existingMiddleName,
        lastName: existingLastName,
        fullName: existingFullName,
    } = existingParty || {};

    const validationSucceeded = useMemo(
        () => validationResponse?.status === TransactionResponseStatus.Success,
        [validationResponse]
    );

    const bannerResults = validationResponse?.validationResult;
    const statusResponse = validationResponse?.status;

    const currAddress = filterNotRemoved(addresses);
    const currPhone = filterNotRemoved(phones);
    const currEmail = filterNotRemoved(emails);

    const identification = identifications?.[0];

    const { identificationValue, usCitizen } = identification || {};

    const handleStepContinue = async () => {
        if (!validationSucceeded && !isChecked) {
            setShowSelectionError(true);
            return;
        } else {
            setShowSelectionError(false);
            goToNext();
        }
    };

    const internalServerCTA = {
        text: t('internal500CTAlinkText'),
        href: Links.Internal500CTAlink,
    };

    const isRolePartyCheck = !rolePartyCheck(
        role,
        party?.partyType as PartyType
    );
    const isRoleCheck = roleCheck(role);

    const nameVisible =
        partyType === PartyType.INDIVIDUAL
            ? [firstName, middleName, lastName]
                  .filter(Boolean)
                  .map((name) => toTitleCase(name))
                  .join(' ')
            : toTitleCase(lastName || '');

    return (
        <WorkflowCard
            title={t('header')}
            subtitle={
                validationSucceeded
                    ? t('status200subtitle') || ''
                    : t('status400subtitle') || ''
            }
            footerContent={
                <TransactionNavigationButtons
                    className="mt-10"
                    disableContinue={
                        statusResponse === StatusCode.InternalServerError
                    }
                    handleContinue={handleStepContinue}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink={leaveTransactionLink}
                />
            }
        >
            <Typography variant={TypographyVariant.H3} className="mt-3 mb-6">
                {t('overview')}
            </Typography>

            {![Roles.PAYOR, Roles.THIRDPARTYDESIGNEE].includes(
                role.toUpperCase() as Roles
            ) && (
                <Typography
                    className="basis-1/2"
                    variant={TypographyVariant.H4}
                >
                    {roleLabel}
                </Typography>
            )}

            <div className="flex">
                <div className="flex w-full flex-row py-4">
                    <Typography
                        className="basis-1/2"
                        variant={TypographyVariant.BodySm}
                    >
                        {nameVisible || DEFAULT_ERROR_STRING}
                    </Typography>
                    <div className="basis-1/4">
                        <Tag
                            text={tagText}
                            className="mx-2 h-6 "
                            variant={tagVariant as TagVariant}
                        />
                    </div>
                </div>
            </div>
            {existingRoleData && Object.keys(existingRoleData).length > 0 && (
                <div className="flex">
                    <div className="flex w-full flex-row pb-4">
                        <Typography
                            className="basis-1/2"
                            variant={TypographyVariant.BodySm}
                        >
                            {toTitleCase(
                                [
                                    existingFirstName,
                                    existingMiddleName,
                                    existingLastName,
                                ]
                                    .filter(Boolean)
                                    .join(' ')
                            ) || existingFullName}
                        </Typography>
                        <div className="basis-1/4">
                            <Tag
                                text={existingTagText}
                                className="mx-2 h-6 "
                                variant={existingTagVariant as TagVariant}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div
                className="my-4 w-full rounded-sm border-2 border-gray-100 p-8"
                key={0}
            >
                <div className="mb-5">
                    <div className="flex">
                        <Typography variant={TypographyVariant.H2}>
                            {nameVisible || DEFAULT_ERROR_STRING}
                        </Typography>
                        <Tag
                            text={tagText}
                            className="m-1 mx-3 h-6"
                            variant={tagVariant as TagVariant}
                        />
                    </div>
                </div>
                {![Roles.PAYOR, Roles.THIRDPARTYDESIGNEE].includes(
                    role.toUpperCase() as Roles
                ) && (
                    <div className="mb-6">
                        <div className="my-4 flex">
                            <div>
                                <Label
                                    variant={LabelVariant.FieldLabel}
                                    label={t('changeReason')}
                                />
                                <Typography variant={TypographyVariant.BodySm}>
                                    {changeReason || DEFAULT_ERROR_STRING}
                                </Typography>
                            </div>
                            <div className="mx-4">
                                <Label
                                    variant={LabelVariant.FieldLabel}
                                    label={t('requiredsupportingdocument')}
                                />
                                <Typography variant={TypographyVariant.BodySm}>
                                    {supportingDocumentAttached ||
                                        DEFAULT_ERROR_STRING}
                                </Typography>
                            </div>
                        </div>
                        <div className="w-[1020px] border border-b-2 border-gray-100"></div>
                    </div>
                )}
                <div className="mb-6">
                    <Typography variant={TypographyVariant.H2}>
                        {t('identification')}
                    </Typography>
                    <div className="my-4 flex">
                        <div>
                            <Label
                                variant={LabelVariant.FieldLabel}
                                label={t('partytype')}
                            />
                            <Typography variant={TypographyVariant.BodySm}>
                                {toTitleCase(partyType) || DEFAULT_ERROR_STRING}
                            </Typography>
                        </div>

                        {partyType === PartyType.TRUST && (
                            <>
                                <div className="mx-4">
                                    <Label
                                        variant={LabelVariant.FieldLabel}
                                        label={t('trustType')}
                                    />
                                    <Typography
                                        variant={TypographyVariant.BodySm}
                                    >
                                        {getTrustTypeLabel(
                                            trustType as any,
                                            t3
                                        ) || DEFAULT_ERROR_STRING}
                                    </Typography>
                                </div>

                                {isRoleCheck && (
                                    <div className="mx-4">
                                        <Label
                                            variant={LabelVariant.FieldLabel}
                                            label={t('trustDate')}
                                        />
                                        <Typography
                                            variant={TypographyVariant.BodySm}
                                        >
                                            {formatDate(trustDate) ||
                                                DEFAULT_ERROR_STRING}
                                        </Typography>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="mx-4">
                            <Label
                                variant={LabelVariant.FieldLabel}
                                label={t('relationshipcurrent')}
                            />
                            <Typography variant={TypographyVariant.BodySm}>
                                {getRelationshipLabel(
                                    relationshipToParty ?? '',
                                    t2
                                ) || DEFAULT_ERROR_STRING}
                            </Typography>
                        </div>

                        <div className="mx-4">
                            <Label
                                variant={LabelVariant.FieldLabel}
                                label={t('uscitizen')}
                                sentenceCase={false}
                            />
                            <Typography variant={TypographyVariant.BodySm}>
                                {usCitizen || DEFAULT_ERROR_STRING}
                            </Typography>
                        </div>

                        <div className="mx-4">
                            <Label
                                variant={LabelVariant.FieldLabel}
                                label={t('ssn')}
                                sentenceCase={false}
                            />
                            <Typography variant={TypographyVariant.BodySm}>
                                <PiiWrapper>
                                    {identificationValue ||
                                        DEFAULT_ERROR_STRING}
                                </PiiWrapper>
                            </Typography>
                        </div>

                        {isRolePartyCheck && (
                            <>
                                <div className="mx-4">
                                    <Label
                                        variant={LabelVariant.FieldLabel}
                                        label={t('gender')}
                                    />
                                    <Typography
                                        variant={TypographyVariant.BodySm}
                                    >
                                        {toTitleCase(gender) ||
                                            DEFAULT_ERROR_STRING}
                                    </Typography>
                                </div>

                                <div className="mx-4">
                                    <Label
                                        variant={LabelVariant.FieldLabel}
                                        label={t('birthdate')}
                                        sentenceCase={false}
                                    />
                                    <Typography
                                        variant={TypographyVariant.BodySm}
                                    >
                                        <PiiWrapper>
                                            {formatDate(dateOfBirth)}
                                        </PiiWrapper>
                                    </Typography>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="w-[1020px] border border-b-2 border-gray-100"></div>
                </div>

                <div className="mb-6">
                    <Typography variant={TypographyVariant.H2}>
                        {t('contactDetails')}
                    </Typography>

                    <div className="my-4 flex flex-wrap">
                        <div
                            className="flex-shrink-0"
                            key={`preferredCommunicationType`}
                        >
                            <Label
                                variant={LabelVariant.FieldLabel}
                                label={t('prefferedMethod')}
                            />
                            <Typography variant={TypographyVariant.BodySm}>
                                {preferredCommunicationType
                                    ? getContactLabel(
                                          preferredCommunicationType,
                                          t2,
                                          role
                                      ) || DEFAULT_ERROR_STRING
                                    : DEFAULT_ERROR_STRING}
                            </Typography>
                        </div>
                        {currAddress.map((address: any, index: number) => (
                            <div
                                className="mx-4 flex-shrink-0"
                                key={`address-${index}`}
                            >
                                <Label
                                    variant={LabelVariant.FieldLabel}
                                    label={`${
                                        address?.addressType
                                            ? `${toTitleCase(
                                                  address.addressType
                                              )} ${t(
                                                  'contact.address'
                                              ).toLowerCase()}`
                                            : t('contact.address')
                                    }`}
                                />
                                <Typography variant={TypographyVariant.BodySm}>
                                    <FormattedAddress address={address ?? {}} />
                                </Typography>
                            </div>
                        ))}
                        {currPhone.map((phone: any, index: number) => (
                            <div
                                className="mx-4 mb-4 flex-shrink-0"
                                key={`phone-${index}`}
                            >
                                <Label
                                    variant={LabelVariant.FieldLabel}
                                    label={`${
                                        phone?.phoneType
                                            ? `${toTitleCase(
                                                  phone.phoneType
                                              )} ${t(
                                                  'contact.number'
                                              ).toLowerCase()}`
                                            : t('contact.number')
                                    }`}
                                />
                                <Typography variant={TypographyVariant.BodySm}>
                                    <FormattedEnterprisePhone
                                        phone={phone ?? {}}
                                    />
                                </Typography>
                            </div>
                        ))}

                        {currEmail.map((email: any, index: number) => (
                            <div
                                className="mx-4 mb-4 flex-shrink-0"
                                key={`email-${index}`}
                            >
                                <Label
                                    variant={LabelVariant.FieldLabel}
                                    label={t('contact.email')}
                                />
                                <Typography variant={TypographyVariant.BodySm}>
                                    {email.emailAddress || DEFAULT_ERROR_STRING}
                                </Typography>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {!validationSucceeded && (
                <div className="mt-10 flex flex-col gap-2">
                    {statusResponse === StatusCode.InternalServerError ? (
                        bannerResults?.map(
                            (result: ValidationResult, index: number) => (
                                <BannerAlert
                                    key={index}
                                    variant={BannerVariant.Error}
                                    canDismiss={false}
                                    cta={
                                        statusResponse ===
                                        StatusCode.InternalServerError
                                            ? internalServerCTA
                                            : undefined
                                    }
                                >
                                    {t('internal500Error')}
                                </BannerAlert>
                            )
                        )
                    ) : (
                        <>
                            {bannerResults?.map(
                                (result: ValidationResult, index: number) => (
                                    <BannerAlert
                                        key={index}
                                        variant={BannerVariant.Error}
                                        canDismiss={false}
                                    >
                                        {result.error} {result.resolution}
                                    </BannerAlert>
                                )
                            )}
                            <div className="my-6 flex flex-row">
                                <CheckboxText
                                    label={t('submitWithErrorsText')}
                                    checked={isChecked}
                                    onChange={() => setIsChecked(!isChecked)}
                                />
                            </div>
                        </>
                    )}
                    {showSelectionError && !isChecked && (
                        <AssistiveText
                            variant={AssistiveTextVariant.Error}
                            text={t('missingCheckToConfirm')}
                        />
                    )}
                </div>
            )}
        </WorkflowCard>
    );
};

export default SummaryStep;
