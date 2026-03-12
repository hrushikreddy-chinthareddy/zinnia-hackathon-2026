import { Tooltip } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { TFunction, useTranslation } from 'next-i18next';

import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { NotificationsTransactionData } from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab/bene-notification-tab.types';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { FormattedAddress } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import { TaskActions } from '@deps/contexts/UpdateNotificationMethodContext';
import { isEmptyObject } from '@deps/helpers/objects.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { Address } from '@zinnia/api-types/types/sor';

import { ClaimCommunicationTypes } from '../death-claim.types';

type TaskActionProps = {
    item: any;
    transactionData: NotificationsTransactionData;
    taskActions: TaskActions[];
    disabled?: boolean;
    tooltipBody?: string;
    tooltipKey?: string;
};

const displayNotificationDetails = ({
    notificationMethod,
    email,
    fax,
    address,
    t,
}: {
    notificationMethod?: ClaimCommunicationTypes;
    email: string;
    fax: string;
    address: Address;
    t: TFunction;
}) => {
    if (notificationMethod === ClaimCommunicationTypes.Email) {
        return (
            <Typography className="truncate" variant={TypographyVariant.BodySm}>
                {t('contactEstablishedStep.notificationMethods.email')}:{' '}
                <PiiWrapper>
                    {isNullEmptyOrUndefined(email)
                        ? DEFAULT_ERROR_STRING
                        : email}
                </PiiWrapper>
            </Typography>
        );
    } else if (notificationMethod === ClaimCommunicationTypes.Fax) {
        return (
            <Typography className="truncate" variant={TypographyVariant.BodySm}>
                {t('contactEstablishedStep.notificationMethods.fax')}:{' '}
                <PiiWrapper>
                    {isNullEmptyOrUndefined(fax) ? DEFAULT_ERROR_STRING : fax}
                </PiiWrapper>
            </Typography>
        );
    } else {
        return (
            <>
                {t('contactEstablishedStep.notificationMethods.address')}:{' '}
                {isEmptyObject(address) ? (
                    DEFAULT_ERROR_STRING
                ) : (
                    <FormattedAddress address={address} />
                )}
            </>
        );
    }
};

export const TaskAction = ({
    item,
    disabled,
    tooltipBody,
    tooltipKey,
    transactionData,
    taskActions,
}: TaskActionProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'updateNotificationMethodForBeneficiary',
    });
    const { t: tCommon } = useTranslation(TranslationFiles.COMMON);
    const labelClasses = clsx('body-sm', {
        'pointer-events-none': disabled,
    });
    const notificationPrefs = transactionData?.entity?.notificationPreferences;
    const originalEmail = notificationPrefs?.email?.emailAddress || '';
    const originalFax = notificationPrefs?.fax?.faxNumber || '';
    const originalAddress = notificationPrefs?.address || {};
    const originalNotificationMethod =
        notificationPrefs?.notificationMethod?.method;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
                <label
                    className={labelClasses}
                    aria-label={`Select ${item.value}`}
                    htmlFor={`radio-${item.value}`}
                    {...(disabled && {
                        'aria-disabled': 'true',
                    })}
                >
                    {item.label}
                </label>
                <Tooltip
                    key={tooltipKey}
                    trigger={
                        <CircleInfoIcon
                            height={'16px'}
                            width={'16px'}
                            className="tooltip-primary"
                        />
                    }
                    triggerAriaLabel={tCommon('allFields.moreInformation')}
                >
                    {tooltipBody}
                </Tooltip>
            </div>
            {taskActions.length > 0 &&
                taskActions.includes(item.value) &&
                item.value !== TaskActions.UPDATE_NOTIFICATION_METHOD && (
                    <div>
                        {displayNotificationDetails({
                            notificationMethod: originalNotificationMethod,
                            email: originalEmail,
                            fax: originalFax,
                            address: originalAddress,
                            t,
                        })}
                    </div>
                )}
        </div>
    );
};
