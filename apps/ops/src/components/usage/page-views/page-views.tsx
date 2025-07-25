import { useTranslation } from 'react-i18next';

import { ZinniaLiveCaseViewsByTransaction } from './zinnia-live-case-views-by-transaction';
import { ZinniaLivePageViews } from './zinnia-live-page-views';

export const PageViews = () => {
    const { t } = useTranslation();

    return (
        <div className="flex gap-4 m-4">
            <ZinniaLivePageViews
                title={t('usage.pageViews.zinniaLivePageViews.title')}
            />
            <ZinniaLiveCaseViewsByTransaction
                title={t('usage.pageViews.zinniaLiveCaseViews.title')}
            />
        </div>
    );
};
