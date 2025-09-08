import {
    TableHeaderCell,
    TableRow,
    TableHeader,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import { TranslationFiles } from '@deps/config/translations';

const FlagQueueTableHeader = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'feature',
    });

    return (
        <TableHeader>
            <TableRow>
                <TableHeaderCell>
                    <Content
                        details={t('flag') as string}
                        variant={ContentVariant.BodySmBold}
                    />
                </TableHeaderCell>
                <TableHeaderCell>
                    <Content
                        details={t('status') as string}
                        variant={ContentVariant.BodySmBold}
                    />
                </TableHeaderCell>
            </TableRow>
        </TableHeader>
    );
};

export default FlagQueueTableHeader;
