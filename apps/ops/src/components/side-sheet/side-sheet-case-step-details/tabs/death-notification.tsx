import { useQuery } from '@tanstack/react-query';
import { Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import {
    ClaimActionTypes,
    ClaimCommunicationTypes,
    RoleType,
} from '@deps/containers/death-claim-container/death-claim.types';
import { FormattedAddress } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import { ZAHARA_DATE_FORMAT } from '@deps/helpers/date.helpers';
import { getName } from '@deps/helpers/party-info-helpers';
import {
    parseAndFormatDate,
    formatPhoneWithAreacode,
    toTitleCase,
    formatFaxNumber,
} from '@deps/helpers/string.helpers';
import { getTransactionEntityQuery } from '@deps/queries/tanstack/transactions/transactionsQueries';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { Address as SorAddress } from '@zinnia/api-types/types/sor';

import {
    DeathNotificationData,
    DeathNotificationSidesheetProps,
} from './death-notification.types';

const DeathNotificationSidesheet = ({
    stepAdditionalData,
}: DeathNotificationSidesheetProps) => {
    const { t } = useTranslation();

    const entityId = stepAdditionalData.value;
    const {
        data: transactionEntity,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['claimsTransactions', entityId],
        queryFn: () => getTransactionEntityQuery(entityId),
    });

    const mapApiDataToDeathNotificationData = (
        apiData: any
    ): DeathNotificationData => {
        const entity = apiData?.entity || {};
        return {
            notifiers: {
                dateOfNotification: parseAndFormatDate(
                    ZAHARA_DATE_FORMAT,
                    'MM-DD-YYYY',
                    entity.notifiers?.dateOfNotification
                ),
                notifierRole: entity.notifiers?.notifierRole,
                party: {
                    fullName:
                        entity.notifiers?.party?.fullName ||
                        getName(entity.notifiers?.party),
                    phone: entity.notifiers?.party?.phone,
                    relationshipToInsured:
                        entity.notifiers?.party?.relationshipToInsured,
                },
                isPrimaryBeneInfoOnFile:
                    entity.notifiers?.isPrimaryBeneInfoOnFile || false,
            },
            owners:
                entity.owners?.map((owner: any) => ({
                    party: {
                        fullName: owner.party?.fullName || getName(owner.party),
                        partyRole: owner.party?.partyRole,
                    },
                    dateOfDeath: parseAndFormatDate(
                        ZAHARA_DATE_FORMAT,
                        'MM-DD-YYYY',
                        owner.dateOfDeath
                    ),
                    isDiedInForeignCountry: owner.isDiedInForeignCountry,
                    isDeceased: owner.isDeceased,
                })) || [],
            beneficiaries:
                entity.beneficiaries?.map((bene: any) => ({
                    party: {
                        fullName: bene.party?.fullName || getName(bene.party),
                    },
                    notificationMethod:
                        bene.notificationPreferences?.notificationMethod
                            ?.method,
                    email: bene.notificationPreferences?.email?.emailAddress
                        ? {
                              emailAddress:
                                  bene.notificationPreferences.email
                                      .emailAddress,
                              action: bene.notificationPreferences.email.action,
                          }
                        : DEFAULT_ERROR_STRING,
                    address: bene.notificationPreferences?.address?.country
                        ? {
                              action: bene.notificationPreferences.address
                                  .action,
                              addressLine1:
                                  bene.notificationPreferences.address
                                      .addressLine1 || '',
                              addressLine2:
                                  bene.notificationPreferences.address
                                      .addressLine2 || '',
                              addressLine3:
                                  bene.notificationPreferences.address
                                      .addressLine3 || '',
                              city:
                                  bene.notificationPreferences.address.city ||
                                  '',
                              state:
                                  bene.notificationPreferences.address.state ||
                                  '',
                              pincode:
                                  bene.notificationPreferences.address
                                      .pincode || '',
                              country:
                                  bene.notificationPreferences.address
                                      .country || '',
                          }
                        : DEFAULT_ERROR_STRING,
                    faxNumber: bene.notificationPreferences?.fax?.faxNumber
                        ? bene.notificationPreferences.fax.faxNumber
                        : DEFAULT_ERROR_STRING,
                })) || [],
        };
    };

    const data: DeathNotificationData | null = transactionEntity
        ? mapApiDataToDeathNotificationData(transactionEntity)
        : null;

    const displayIsLoading = () => {
        return (
            <div className="flex w-full flex-col">
                <div className="mt-0.5">
                    <InProgressIcon
                        height={18}
                        width={18}
                        role="presentation"
                        className="shrink-0 text-gray-600 transform-origin-center duration-5000 animate-spin ease-linear"
                        aria-hidden={true}
                    />
                </div>
                <div>
                    <Typography
                        variant={TypographyVariant.BodySmBold}
                        className="text-gray-600"
                    >
                        {t('deathNotification.loadingTransactions')}
                    </Typography>
                </div>
            </div>
        );
    };

    const displayError = () => {
        return (
            <div className="flex w-full flex-col">
                <div className="mt-0.5">
                    <InProgressIcon
                        height={18}
                        width={18}
                        role="presentation"
                        aria-hidden={true}
                        className="shrink-0 text-gray-600"
                    />
                </div>
                <div>
                    <Typography
                        variant={TypographyVariant.BodySmBold}
                        className="text-gray-600"
                    >
                        {t('deathNotification.errorGettingTransactions')}
                    </Typography>
                </div>
            </div>
        );
    };

    const displayNoData = () => {
        return (
            <div className="mt-0.5">
                <Typography
                    variant={TypographyVariant.H3}
                    className="mb-4 border-b pb-2"
                >
                    {t('deathNotification.title')}
                </Typography>
                <div className="text-sm font-bold">
                    <AssistiveText
                        text={t('deathNotification.noData')}
                        variant={AssistiveTextVariant.Default}
                        iconOverride={
                            <Icon
                                width={16}
                                height={16}
                                type={IconType.DOCUMENT_TEXT}
                            />
                        }
                    />
                </div>
            </div>
        );
    };

    if (isLoading) {
        return displayIsLoading();
    }

    if (isError) {
        return displayError();
    }

    if (!data) {
        return displayNoData();
    }

    return (
        <div className="flex w-full flex-col">
            <Typography variant={TypographyVariant.H3} className="mb-2">
                {t('deathNotification.title')}
            </Typography>

            <div className="flex flex-col w-full">
                <label className="font-primary text-lg mt-6 mb-4">
                    {t('deathNotification.notifierDetails.title')}
                </label>
                <div className="grid grid-cols-5 gap-2 text-md align-center mb-4">
                    <div className="col-span-2 text-[--color-base-text-secondary]">
                        {t(
                            'deathNotification.notifierDetails.dateOfNotification'
                        )}
                    </div>
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className="col-span-3"
                    >
                        {data.notifiers.dateOfNotification ||
                            DEFAULT_ERROR_STRING}
                    </Typography>
                    <div className="col-span-2 text-[--color-base-text-secondary]">
                        {t('deathNotification.notifierDetails.notifierRole')}
                    </div>
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className="col-span-3"
                    >
                        {data.notifiers.notifierRole || DEFAULT_ERROR_STRING}
                    </Typography>
                    <div className="col-span-2 text-[--color-base-text-secondary]">
                        {t('deathNotification.notifierDetails.notifierName')}
                    </div>
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className="col-span-3"
                    >
                        <PiiWrapper>
                            {data.notifiers.party?.fullName ||
                                DEFAULT_ERROR_STRING}
                        </PiiWrapper>
                    </Typography>
                    <div className="col-span-2 text-[--color-base-text-secondary]">
                        {t(
                            'deathNotification.notifierDetails.notifierPhoneNumber'
                        )}
                    </div>
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className="col-span-3"
                    >
                        <PiiWrapper>
                            {data.notifiers.party?.phone?.dialNumber
                                ? formatPhoneWithAreacode(
                                      data.notifiers.party?.phone
                                  )
                                : DEFAULT_ERROR_STRING}
                        </PiiWrapper>
                    </Typography>
                    <div className="col-span-2 text-[--color-base-text-secondary]">
                        {t('deathNotification.notifierDetails.beneOnFileFlag')}
                    </div>
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className="col-span-3"
                    >
                        {data.notifiers.isPrimaryBeneInfoOnFile
                            ? t('deathNotification.labels.yes')
                            : t('deathNotification.labels.no')}
                    </Typography>
                    {data.notifiers.notifierRole === RoleType.Other && (
                        <>
                            <div className="col-span-2 text-[--color-base-text-secondary]">
                                {t(
                                    'deathNotification.notifierDetails.relationshipToInsured'
                                )}
                            </div>
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className="col-span-3"
                            >
                                {data.notifiers.party?.relationshipToInsured ||
                                    DEFAULT_ERROR_STRING}
                            </Typography>
                        </>
                    )}
                </div>
            </div>

            {data.owners.some((owner) => owner.isDeceased) && (
                <div className="flex flex-col w-full">
                    <label className="font-primary text-lg mt-6 mb-4">
                        {t('deathNotification.ownerDetails.title')}
                    </label>
                    {data.owners
                        .filter((owner) => owner.isDeceased)
                        .map((owner, index) => (
                            <div key={index} className="mb-4">
                                <Typography
                                    variant={TypographyVariant.BodySmBold}
                                    className="text-gray-800 mb-2"
                                >
                                    <PiiWrapper>
                                        {toTitleCase(owner.party.fullName)}
                                    </PiiWrapper>
                                    &nbsp;({toTitleCase(owner.party.partyRole)})
                                </Typography>
                                <div className="grid grid-cols-5 gap-2 text-md align-center">
                                    <div className="col-span-2 text-[--color-base-text-secondary]">
                                        {t(
                                            'deathNotification.ownerDetails.foreignDeathFlag'
                                        )}
                                    </div>
                                    <Typography
                                        variant={TypographyVariant.BodySm}
                                        className="col-span-3"
                                    >
                                        {owner.isDiedInForeignCountry
                                            ? t('deathNotification.labels.yes')
                                            : t('deathNotification.labels.no')}
                                    </Typography>
                                    <div className="col-span-2 text-[--color-base-text-secondary]">
                                        {t(
                                            'deathNotification.ownerDetails.dateOfDeath'
                                        )}
                                    </div>
                                    <Typography
                                        variant={TypographyVariant.BodySm}
                                        className="col-span-3"
                                    >
                                        {owner.dateOfDeath ||
                                            DEFAULT_ERROR_STRING}
                                    </Typography>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            <div className="flex flex-col w-full">
                <label className="font-primary text-lg mt-6 mb-4">
                    {t('deathNotification.beneficiaryDetails.title')}
                </label>
                {data.beneficiaries.length > 0 ? (
                    data.beneficiaries.map((bene, index) => {
                        const hasValidNotification =
                            (bene.notificationMethod ===
                                ClaimCommunicationTypes.Email &&
                                bene.email?.emailAddress &&
                                bene.email.action !== ClaimActionTypes.NONE) ||
                            (bene.notificationMethod ===
                                ClaimCommunicationTypes.Fax &&
                                bene.faxNumber) ||
                            (bene.notificationMethod ===
                                ClaimCommunicationTypes.Mail &&
                                bene.address &&
                                bene.address.country &&
                                bene.address.action !== ClaimActionTypes.NONE);

                        return (
                            <div key={index} className="mb-4">
                                <Typography
                                    variant={TypographyVariant.BodySmBold}
                                    className="text-gray-800 mb-2"
                                >
                                    <PiiWrapper>
                                        {toTitleCase(bene.party.fullName)}
                                    </PiiWrapper>
                                </Typography>
                                {hasValidNotification ? (
                                    <div className="grid grid-cols-5 gap-2 text-md align-center">
                                        <div className="col-span-2 text-[--color-base-text-secondary]">
                                            {t(
                                                `deathNotification.beneficiaryDetails.${bene.notificationMethod.toLowerCase()}`
                                            )}
                                        </div>
                                        <Typography
                                            variant={TypographyVariant.BodySm}
                                            className="col-span-3"
                                            asTag="div"
                                        >
                                            {bene.notificationMethod ===
                                                ClaimCommunicationTypes.Email &&
                                            bene.email?.emailAddress ? (
                                                <PiiWrapper>
                                                    {bene.email.emailAddress}
                                                </PiiWrapper>
                                            ) : bene.notificationMethod ===
                                                  ClaimCommunicationTypes.Fax &&
                                              bene.faxNumber ? (
                                                <PiiWrapper>
                                                    {formatFaxNumber(
                                                        bene.faxNumber
                                                    )}
                                                </PiiWrapper>
                                            ) : bene.notificationMethod ===
                                                  ClaimCommunicationTypes.Mail &&
                                              bene.address &&
                                              bene.address.country ? (
                                                <FormattedAddress
                                                    address={
                                                        bene.address as SorAddress
                                                    }
                                                />
                                            ) : (
                                                DEFAULT_ERROR_STRING
                                            )}
                                        </Typography>
                                    </div>
                                ) : (
                                    <Typography
                                        variant={TypographyVariant.BodySm}
                                        className="text-gray-600"
                                    >
                                        {t(
                                            'deathNotification.beneficiaryDetails.noData'
                                        )}
                                    </Typography>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className="text-gray-600"
                    >
                        {t('deathNotification.beneficiaryDetails.noData')}
                    </Typography>
                )}
            </div>
        </div>
    );
};

export default DeathNotificationSidesheet;
