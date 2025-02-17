import { TFunction, useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import { ExceptionStatuses } from '@deps/models/case/exception-instance';

import { formatTimestamp } from './progress-tab-helpers';
import { ExceptionView, TaskView } from './progress-tab-types';
import Tasks from './tasks';

interface GroupedExceptions {
    [taskId: string]: { tasks: TaskView[]; exceptions: ExceptionView[] };
}

const renderException = (exception: ExceptionView, t: TFunction, unmapped?: boolean) => {
    return (
        <>
            <div className="flex w-full flex-col justify-between lg:flex-row">
                <Content
                    className={exception.status === ExceptionStatuses.Resolved ? 'text-semantic-success' : 'text-semantic-error'}
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
        </>
    );
};

export function groupExceptions(exceptions: ExceptionView[]): GroupedExceptions {
    return exceptions.reduce((acc: GroupedExceptions, exception: ExceptionView) => {
        if (exception.tasks.length === 0) {
            if (!acc['no-task']) {
                acc['no-task'] = { tasks: [], exceptions: [] };
            }
            acc['no-task'].exceptions.push(exception);
        } else {
            exception.tasks.forEach(task => {
                if (!acc[task.id]) {
                    acc[task.id] = { tasks: [], exceptions: [] };
                }
                if (!acc[task.id].tasks.some(t => t.id === task.id)) {
                    acc[task.id].tasks.push(task);
                }
                if (!acc[task.id].exceptions.some(e => e.id === exception.id)) {
                    acc[task.id].exceptions.push(exception);
                }
            });
        }
        return acc;
    }, {});
}

export default function Exceptions({ exceptions, unmapped = false }: { exceptions: ExceptionView[]; unmapped?: boolean }) {
    const { t } = useTranslation();
    if (!exceptions?.length) {
        return null;
    }

    const groupedExceptions = groupExceptions(exceptions);

    return (
        <ul>
            {Object.entries(groupedExceptions).map(([taskId, group]) => (
                <li className="flex w-full flex-col" key={taskId}>
                    {group.exceptions.map(exception => (
                        <div key={exception.id}>{renderException(exception, t, unmapped)}</div>
                    ))}
                    {group.tasks.length > 0 && <Tasks tasks={group.tasks} />}
                </li>
            ))}
        </ul>
    );
}
