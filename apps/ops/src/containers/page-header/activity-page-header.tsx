import { useTranslation } from 'next-i18next';

import PageHeader from '@deps/components/page-header/page-header';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';

export default function ActivityPageHeader() {
    const { t } = useTranslation();
    const { breadcrumb } = useBreadcrumb();

    return (
        <div className="flex self-stretch">
            <PageHeader
                headerText={t('pageHeader.activity.headerText') || ''}
                breadcrumbText={breadcrumb?.text}
                breadcrumbUrl={breadcrumb?.url}
            />
        </div>
    );
}
