import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import { initialFilters, CaseManagementFiltersContext } from '@deps/contexts/CaseManagementFilters';
import { ReactComponent as CircleExclamationIcon } from '@deps/styles/elements/icons/circles/circle-exclamation.svg';

const CaseSearchResultsEmptyCard = () => {
    const { t } = useTranslation();
    const [, setCaseManagementFilters] = useContext(CaseManagementFiltersContext);

    const resetSearch = () => {
        setCaseManagementFilters(initialFilters);
    };

    return (
        <div className="flex h-[500px] w-full items-center justify-center rounded border-2 border-dashed border-semantic-warning bg-white shadow-sm">
            <CardInfo
                icon={<CircleExclamationIcon role=" presentation" className="text-semantic-error" height={50} width={50} />}
                title={t('caseManagementDashboard.search.empty.title')}
                subtitle={t('caseManagementDashboard.search.empty.paragraph')}
                cta={{ action: () => resetSearch(), text: t('dashboard.search.empty.button.text') }}
            />
        </div>
    );
};

export default CaseSearchResultsEmptyCard;
