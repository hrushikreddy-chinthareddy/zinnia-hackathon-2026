import { TFunction, useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import { ExceptionStatuses } from '@deps/models/case/exception-instance';

import { formatTimestamp } from './progress-tab-helpers';
import { ExceptionView, GroupedExceptions } from './progress-tab-types';
import Tasks from './tasks';


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


export default function Exceptions({ exceptions, unmapped = false, groupedExceptions }: { exceptions: ExceptionView[]; unmapped?: boolean, groupedExceptions: GroupedExceptions }) {
    const { t } = useTranslation();
    if (!exceptions?.length) {
        return null;
    }

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
