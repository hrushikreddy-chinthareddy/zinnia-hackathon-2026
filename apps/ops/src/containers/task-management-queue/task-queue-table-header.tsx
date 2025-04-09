import { TableHeaderCell, TableRow, TableHeader } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import { TranslationFiles } from '@deps/config/translations';

const TaskQueueTableHeader = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'taskManagementQueue' });

    return (
        <TableHeader>
            <TableRow>
                {/* This header cell is needed so the link can come first in the Table Row, without it the table body will shift right one column too far */}
                <TableHeaderCell className="sr-only">{''}</TableHeaderCell>
                <TableHeaderCell>
                    <Content details={t('task') as string} variant={ContentVariant.BodySmBold} />
                </TableHeaderCell>
                <TableHeaderCell>
                    <Content details={t('taskStatus') as string} variant={ContentVariant.BodySmBold} />
                </TableHeaderCell>
                <TableHeaderCell>
                    <Content details={t('carrierPolicy') as string} variant={ContentVariant.BodySmBold} />
                </TableHeaderCell>
                <TableHeaderCell>
                    <Content details={t('assignee') as string} variant={ContentVariant.BodySmBold} />
                </TableHeaderCell>
                <TableHeaderCell>
                    <Content details={t('created') as string} variant={ContentVariant.BodySmBold} />
                </TableHeaderCell>
                <TableHeaderCell colSpan={2}>
                    <Content details={''} variant={ContentVariant.BodySmBold} />
                </TableHeaderCell>
            </TableRow>
        </TableHeader>
    );
};

export default TaskQueueTableHeader;
