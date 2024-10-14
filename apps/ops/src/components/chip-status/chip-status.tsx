import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { toSentenceCase } from '@deps/helpers/string.helper';
import { Statuses } from '@deps/models/case/case';

export interface ChipStatusProps {
    status: Statuses | null;
    statusText?: string;
    classNames?: string;
}

const ChipStatus: React.FC<ChipStatusProps> = ({ status, statusText, classNames = '' }) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    const getStatusText = (status: Statuses | null) => {
        switch (status) {
            case Statuses.New:
                return t('status.new');
            case Statuses.InProgress:
                return t('status.inProgress');
            case Statuses.Exception:
                return t('status.exception');
            case Statuses.Completed:
                return t('status.completed');
            case Statuses.Canceled:
                return t('status.canceled');
            case Statuses.NotStarted:
            default:
                return t('status.notStarted');
        }
    };

    const dynamicStatusText = getStatusText(status);

    const classes = clsx(
        'inline-block select-none whitespace-nowrap text-center font-primary text-sm font-semibold leading-4',
        {
            'w-fit rounded border-1 border-semantic-info bg-semantic-info-light px-2 text-semantic-info':
                status === Statuses.New || statusText,
            'w-full rounded-full border-2 border-semantic-info bg-semantic-info-light px-2 py-1 text-semantic-info':
                status === Statuses.InProgress,
            'w-full rounded-full border-2 border-semantic-error bg-semantic-error-light px-2 py-1 text-semantic-error':
                status === Statuses.Exception,
            'w-full rounded-full border-2 border-semantic-success bg-semantic-success-light px-2 py-1 text-semantic-success':
                status === Statuses.Completed,
            'w-full rounded-full border-2 border-gray-200 bg-gray-50 px-2 py-1 text-gray-900':
                status === Statuses.NotStarted || status === Statuses.Canceled || status === null || !statusText,
        },
        classNames
    );

    return (
        <span data-testid="chip-status" className={classes}>
            {statusText ? statusText : toSentenceCase(dynamicStatusText)}
        </span>
    );
};

export default ChipStatus;
