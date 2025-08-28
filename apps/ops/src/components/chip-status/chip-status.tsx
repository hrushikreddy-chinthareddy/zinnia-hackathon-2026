import { TransactionStatus } from '@zinnia/api-types/types/sor';
import { Badge, BadgeVariant } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { FC } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { toSentenceCase } from '@deps/helpers/string.helpers';
import { Statuses } from '@deps/models/case/case';
import { isObjectKey } from '@deps/utils/types';

type ChipStatusText = Statuses | TransactionStatus;
export interface ChipStatusProps {
    status?: ChipStatusText | string;
    statusText?: string;
    classNames?: string;
}

const statusMap: Partial<Record<ChipStatusText, string>> = {
    [Statuses.InProgress]: 'inProgress',
    [Statuses.Exception]: 'exception',
    [Statuses.Completed]: 'completed',
    [Statuses.Canceled]: 'canceled',
    [Statuses.NotStarted]: 'notStarted',
    [Statuses.Withdrawn]: 'withdrawn',
};

const variantMap: Partial<Record<ChipStatusText, BadgeVariant>> = {
    [Statuses.Canceled]: BadgeVariant.WARNING,
    [Statuses.Exception]: BadgeVariant.ERROR,
    [Statuses.InProgress]: BadgeVariant.INFO,
    [Statuses.Withdrawn]: BadgeVariant.DEFAULT,
    [TransactionStatus.CANCELED]: BadgeVariant.ERROR,
    [TransactionStatus.REVERSED]: BadgeVariant.ERROR,
};

const ChipStatus: FC<ChipStatusProps> = ({
    status,
    statusText,
    classNames,
    ...props
}) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'status',
    });

    let dynamicText = '';

    if (statusText?.length) {
        dynamicText = statusText;
    } else if (status?.length) {
        if (isObjectKey(status, statusMap)) {
            dynamicText = t(`${statusMap[status]}`);
        } else {
            dynamicText = status;
        }
    }

    let variant: BadgeVariant = BadgeVariant.DEFAULT;

    if (status && isObjectKey(status, variantMap)) {
        variant = variantMap[status] || BadgeVariant.DEFAULT;
    }

    return (
        <Badge
            className={clsx(classNames)}
            variant={variant}
            data-testid="chip-status"
            label={toSentenceCase(dynamicText)}
            {...props}
        />
    );
};

export default ChipStatus;
