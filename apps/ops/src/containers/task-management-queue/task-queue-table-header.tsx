import { TableHeaderCell, TableRow, TableHeader } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import { TranslationFiles } from '@deps/config/translations';

const TaskQueueTableHeader = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'taskManagementQueue' });

    return (
        <TableHeader>
            <TableRow>
                <TableHeaderCell>
                    <Content details={t('task') as string} variant={ContentVariant.BodySmBold} />
                </TableHeaderCell>
                <TableHeaderCell>
                    <Content details={t('client') as string} variant={ContentVariant.BodySmBold} />
                </TableHeaderCell>
                <TableHeaderCell>
                    <Content details={t('process') as string} variant={ContentVariant.BodySmBold} />
                </TableHeaderCell>
                <TableHeaderCell>
                    <Content details={t('status') as string} variant={ContentVariant.BodySmBold} />
                </TableHeaderCell>
                <TableHeaderCell>
                    <Content details={t('createdAt') as string} variant={ContentVariant.BodySmBold} />
                </TableHeaderCell>
                <TableHeaderCell>
                    <Content details={''} variant={ContentVariant.BodySmBold} />
                </TableHeaderCell>
                <TableHeaderCell>
                    <Content details={''} variant={ContentVariant.BodySmBold} />
                </TableHeaderCell>
            </TableRow>
        </TableHeader>
    );
}

export default TaskQueueTableHeader;
