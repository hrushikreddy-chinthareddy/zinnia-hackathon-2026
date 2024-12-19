import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';

import { formatTimestamp } from './progress-tab-helpers';
import { ExceptionView } from './progress-tab-types';
import Tasks from './tasks';

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
                        <div className="flex w-full flex-col justify-between lg:flex-row">
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
            {isSingleTask && (
                <li className="flex w-full flex-col">
                    <div className="flex w-full flex-col justify-between lg:flex-row">
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
