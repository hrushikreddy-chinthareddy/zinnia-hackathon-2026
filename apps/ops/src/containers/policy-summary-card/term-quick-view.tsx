import { useTranslation } from 'react-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';
import { translateYearOrYears } from '@deps/helpers/string.helpers';

import BaseDeathBenefit from './display-fields/base-death-benefit';
import IssueDate from './display-fields/issue-date';
import MaturityDate from './display-fields/maturity-date';
import UpcomingPremiumDisplayField from './display-fields/upcoming-premium';
import { QuickViewRoot } from './quick-view-root/quick-view-root';

export const TermQuickView = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation([
        TranslationFiles.COMMON,
        TranslationFiles.COLDEFS,
    ]);

    return (
        <QuickViewRoot
            title={t('dashboard.search.results.policySummaryCard.header2')}
        >
            <UpcomingPremiumDisplayField policy={policy} />
            <BaseDeathBenefit baseDeathBenefit={policy.baseDeathBenefit} />
            <IssueDate issueDate={policy.issueDate} />
            <MaturityDate maturityDate={policy.maturityDate} />
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('colDefs:policySummary.policyTerm')}
                />
                <Content
                    details={translateYearOrYears(policy.fixedCostPeriod, t)}
                    variant={ContentVariant.BodySm}
                />
            </div>
        </QuickViewRoot>
    );
};
