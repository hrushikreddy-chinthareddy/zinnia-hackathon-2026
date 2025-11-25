import { useTranslation } from 'next-i18next';

import { PageHeader } from '@deps/components/page-header/page-header';

interface PeoplePageHeaderContainerProps {
    breadcrumbText?: string;
    breadcrumbUrl?: string;
    onClick?: () => void;
    hideControls?: boolean;
}

const PeoplePageHeaderContainer = ({
    breadcrumbText,
    breadcrumbUrl,
    onClick,
}: PeoplePageHeaderContainerProps) => {
    const { t } = useTranslation();

    return (
        <PageHeader
            headerText={t('pageHeader.people.headerText') || ''}
            breadcrumbText={breadcrumbText}
            breadcrumbUrl={breadcrumbUrl}
            onClick={onClick}
        />
    );
};

export default PeoplePageHeaderContainer;
