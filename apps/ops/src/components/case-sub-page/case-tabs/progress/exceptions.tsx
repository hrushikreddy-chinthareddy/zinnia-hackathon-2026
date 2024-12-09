import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import { ExceptionStatuses } from '@deps/models/case/exception-instance';

import { formatTimestamp } from './progress-tab-helpers';
import { ExceptionView } from './progress-tab-types';
import Tasks from './tasks';

const TaskTypeMap: Record<string, string> = {
    ['SUITABILITY_REVIEW']: 'suitability review',
};

export default function Exceptions({ exceptions, unmapped = false }: { exceptions: ExceptionView[]; unmapped?: boolean }) {
    const { t } = useTranslation();
    if (!exceptions?.length) {
        return null;
    }

    const areGroupedExceptions = exceptions.every(
        exception => exception.tasks.length > 0 && exception.tasks.every(task => task.id === exceptions[0].tasks[0].id)
    );

    return (
        <ul>
            {!areGroupedExceptions &&
                exceptions.map(exception => (
                    <li className="flex w-full flex-col" key={exception.id}>
                        <div className="flex w-full flex-col justify-between lg:flex-row">
                            <Content
                                className={exception.status === ExceptionStatuses.New ? 'text-semantic-error' : 'text-semantic-success'}
                                contentClassName="mt-1"
                                variant={ContentVariant.BodySm}
                                details={exception.description}
                            />
                            {unmapped && (
                                <Content
                                    className="text-gray-600"
                                    contentClassName="mt-1"
                                    variant={ContentVariant.BodySm}
                                    details={t('caseOverview.tabs.since', { date: formatTimestamp(exception.updatedAt) }) as string}
                                />
                            )}
                        </div>
                        <Tasks tasks={exception.tasks} />
                    </li>
                ))}
            {areGroupedExceptions && (
                <li className="flex w-full flex-col">
                    <div className="flex w-full flex-col justify-between lg:flex-row">
                        <Content
                            className="text-semantic-error"
                            contentClassName="mt-1"
                            variant={ContentVariant.BodySm}
                            details={t(`One or more ${TaskTypeMap[exceptions[0].tasks[0].description]} exceptions found`) as string}
                        />
                        {unmapped && (
                            <Content
                                className="text-gray-600"
                                contentClassName="mt-1"
                                variant={ContentVariant.BodySm}
                                details={t('caseOverview.tabs.since', { date: formatTimestamp(exceptions[0].updatedAt) }) as string}
                            />
                        )}
                    </div>
                    <Tasks tasks={exceptions[0].tasks} />
                </li>
            )}
        </ul>
    );
}
