import { useTranslation } from 'next-i18next';
import React from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import { ExceptionStatuses } from '@deps/models/case/exception-instance';

import { formatTimestamp } from './progress-tab-helpers';
import { ExceptionView } from './progress-tab-types';
import Tasks from './tasks';

export default function Exceptions({ exceptions, unmapped = false }: { exceptions: ExceptionView[]; unmapped?: boolean }) {
    const { t } = useTranslation();
    if (!exceptions.length) {
        return null;
    }

    return (
        <ul>
            {exceptions.map(exception => (
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
        </ul>
    );
}
