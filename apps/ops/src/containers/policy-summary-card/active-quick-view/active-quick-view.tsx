import { useTranslation } from 'react-i18next';

import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';
import { ProductType } from '@zinnia/api-types/types/sor';

import EverlyIul from './everly-iul';
import EverlyUl from './everly-ul';
import { QuickViewRoot } from '../quick-view-root/quick-view-root';

export const ActiveQuickView = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation();

    return (
        <QuickViewRoot
            title={t('dashboard.search.results.policySummaryCard.header2')}
        >
            {policy?.product?.productType ===
            ProductType.INDEXEDUNIVERSALLIFE ? (
                <EverlyIul policy={policy} />
            ) : (
                <EverlyUl policy={policy} />
            )}
        </QuickViewRoot>
    );
};
