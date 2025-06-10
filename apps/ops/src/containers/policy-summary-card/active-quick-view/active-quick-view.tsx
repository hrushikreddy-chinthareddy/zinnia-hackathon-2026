import { ProductType } from '@xd/api-types/dist/generated-types/sor';
import { useTranslation } from 'react-i18next';

import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';

import { QuickViewRoot } from '../policy-summary-card';
import EverlyIul from './everly-iul';
import EverlyUl from './everly-ul';

export const ActiveQuickView = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation();

    return (
        <QuickViewRoot title={t('dashboard.search.results.policySummaryCard.header2')}>
            {policy?.product?.productType === ProductType.INDEXEDUNIVERSALLIFE ? (
                <EverlyIul policy={policy} />
            ) : (
                <EverlyUl policy={policy} />
            )}
        </QuickViewRoot>
    );
};
