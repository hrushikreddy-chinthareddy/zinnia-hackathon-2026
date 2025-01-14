import { TFunction, useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import { ExceptionStatuses } from '@deps/models/case/exception-instance';
import { TaskType } from '@deps/models/case/task';

import { formatTimestamp } from './progress-tab-helpers';
import { ExceptionView } from './progress-tab-types';
import Tasks from './tasks';

const TaskTypeMap: Record<string, string> = {
    ['SUITABILITY_REVIEW']: 'suitability review',
};

const renderException = (exception: ExceptionView, isSingleTask: boolean, t: TFunction, unmapped?: boolean) => {
    return (
        <>
            {exception.tasks.every(task => task.description !== TaskType.SuitabilityReview) && (
                <div className="flex w-full flex-col justify-between lg:flex-row">
                    <Content
                        className={exception.status === ExceptionStatuses.Resolved ? 'text-semantic-success' : 'text-semantic-error'}
                        contentClassName="mt-1"
                        variant={ContentVariant.BodySm}
                        details={
                            !isSingleTask
                                ? exception.description
                                : (t('caseOverview.tabs.commonTaskIssues', {
                                      taskType: TaskTypeMap[exception.tasks[0].description],
                                  }) as string)
                        }
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
            )}
        </>
    );
};

export default function Exceptions({ exceptions, unmapped = false }: { exceptions: ExceptionView[]; unmapped?: boolean }) {
    const { t } = useTranslation();
    if (!exceptions?.length) {
        return null;
    }

    const isSingleTask = exceptions.every(
        exception => exception.tasks.length > 0 && exception.tasks.every(task => task.id === exceptions[0].tasks[0].id)
    );

    return (
        <ul>
            {!isSingleTask &&
                exceptions.map(exception => (
                    <li className="flex w-full flex-col" key={exception.id}>
                        {renderException(exception, isSingleTask, t, unmapped)}
                        <Tasks tasks={exception.tasks} />
                    </li>
                ))}
            {isSingleTask && (
                <li className="flex w-full flex-col">
                    {renderException(exceptions[0], isSingleTask, t, unmapped)}
                    <Tasks tasks={exceptions[0].tasks} />
                </li>
            )}
        </ul>
    );
}
