import { Badge, BadgeVariant } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { FC } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { toSentenceCase } from '@deps/helpers/string.helper';
import { Statuses } from '@deps/models/case/case';
import { TransactionStatus } from '@deps/models/policy/sor-policy';
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
};

const variantMap: Partial<Record<ChipStatusText, BadgeVariant>> = {
    [Statuses.Canceled]: BadgeVariant.WARNING,
    [Statuses.Exception]: BadgeVariant.ERROR,
    [Statuses.InProgress]: BadgeVariant.INFO,
    [TransactionStatus.Canceled]: BadgeVariant.ERROR,
    [TransactionStatus.Reversed]: BadgeVariant.ERROR,
};

const ChipStatus: FC<ChipStatusProps> = ({ status, statusText, classNames }) => {
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

    return <Badge className={clsx(classNames)} variant={variant} data-testid="chip-status" label={toSentenceCase(dynamicText)} />;
};

export default ChipStatus;
