import Head from 'next/head';
import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { DEFAULT_PAGE_TITLE } from '@deps/constants/page-title';

export const PageHead = ({ titleKey }: { titleKey: string }) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'site.pageTitles',
    });

    return (
        <Head>
            <title>{`${t(titleKey)} | ${DEFAULT_PAGE_TITLE}`}</title>
        </Head>
    );
};
