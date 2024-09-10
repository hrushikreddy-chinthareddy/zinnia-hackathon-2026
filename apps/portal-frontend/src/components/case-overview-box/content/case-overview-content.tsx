import { useTranslation } from 'next-i18next';
import React from 'react';

import CaseOverviewStatus from '@deps/components/case-overview-box/content/case-overview-status';
import { TranslationFiles } from '@deps/config/translations';
import { Statuses } from '@deps/models/case/case';
import { ExceptionInstance, ExceptionStatuses } from '@deps/models/case/exception-instance';

export interface CaseOverviewContentProps {
    activeToggleBtn: string;
    openExceptions: ExceptionInstance[];
    resolvedExceptions: ExceptionInstance[];
    status: Statuses | ExceptionStatuses;
    updatedAt: string;
    createdAt: string;
}

const CaseOverviewContent = ({
    activeToggleBtn,
    openExceptions,
    resolvedExceptions,
    status,
    updatedAt,
    createdAt,
}: CaseOverviewContentProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    const divider = <div className="my-6 h-0.5 w-full bg-gray-100" />;

    const renderException = (
        exception: Omit<ExceptionInstance, 'status'> & { status: Statuses | ExceptionStatuses },
        index: number,
        arrayLength: number
    ) => (
        <div key={exception.id}>
            <CaseOverviewStatus
                category={exception.category}
                status={exception.status}
                reason={exception.reason}
                detailedReason={exception.detailedReason}
                updatedAt={exception.updatedAt}
                createdAt={exception.createdAt}
            />
            {index < arrayLength - 1 && divider}
        </div>
    );

    const defaultException = (status: Statuses | ExceptionStatuses = Statuses.NotStarted, updatedAt: string, createdAt: string) => {
        let keyRoot: string;
        switch (status) {
            case Statuses.InProgress:
                keyRoot = 'caseOverview.caseStatus.inProgress';
                break;
            case Statuses.Exception:
                keyRoot = 'caseOverview.caseStatus.exception';
                break;
            case Statuses.Completed:
                keyRoot = 'caseOverview.caseStatus.completed';
                break;
            default:
                keyRoot = 'caseOverview.caseStatus.notStarted';
                break;
        }

        return {
            id: 'default',
            status: status,
            category: t(`${keyRoot}.reasonNoExceptions`),
            reason: status === Statuses.Completed ? '' : t(`${keyRoot}.reasonNoExceptions`),
            detailedReason: status === Statuses.Completed ? '' : t(`${keyRoot}.detailedReason`),
            updatedAt: updatedAt,
            createdAt: createdAt,
            eventRef: [],
            additionalData: {},
        };
    };

    const exceptionsToRender = activeToggleBtn === 'open' ? openExceptions : resolvedExceptions;

    return (
        <div className="w-full flex-col">
            {exceptionsToRender.length === 0
                ? renderException(defaultException(status, updatedAt, createdAt), 0, 0)
                : exceptionsToRender.map((exception, index) => renderException(exception, index, exceptionsToRender.length))}{' '}
        </div>
    );
};

export default CaseOverviewContent;
