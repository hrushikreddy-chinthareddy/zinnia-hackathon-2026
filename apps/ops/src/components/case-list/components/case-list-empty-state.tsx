import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import { ReactComponent as CircleExclamationIcon } from '@deps/styles/elements/icons/circles/circle-exclamation.svg';

export const CaseListEmptyState = () => {
    const { t } = useTranslation();

    return (
        <div className="flex h-[500px] w-full items-center justify-center rounded border-2 border-dashed border-semantic-warning bg-white shadow-sm">
            <CardInfo
                icon={
                    <CircleExclamationIcon
                        className="text-semantic-error"
                        height={50}
                        width={50}
                    />
                }
                title={t('caseManagementDashboard.search.empty.title')}
                subtitle={t('caseManagementDashboard.search.empty.paragraph')}
            />
        </div>
    );
};
