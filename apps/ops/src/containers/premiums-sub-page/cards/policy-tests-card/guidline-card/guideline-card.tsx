import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';
import PolicyTestCard from '@deps/containers/mec-card/policy-test-card/policy-test-card';
import { Policy } from '@zinnia/api-types/types/sor';

interface GuidelineCardProps {
    policy: Policy;
}

const GuidelineCard = ({ policy }: GuidelineCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'premium.policyTestsCard.guideline',
    });
    const guideline = {
        compare:
            (policy?.accountValues?.cumulativePremiumSinceIssue || 0) -
            (policy?.withdrawalValues?.totalWithdrawalAmount || 0),
        total: Math.max(
            policy?.testValues?.guidelinePremium?.guidelineSinglePremium || 0,
            policy?.testValues?.guidelinePremium
                ?.totalGuidelineLevelPremiumSinceIssue || 0
        ),
    };

    return (
        <PolicyTestCard
            amountProps={{
                label: t('amountRemaining.label'),
                tooltipBody: t('amountRemaining.tooltipBody'),
                tooltipTitle: t('amountRemaining.label'),
            }}
            basisProps={{
                label: t('basis.label'),
                tooltipBody: t('basis.tooltipBody'),
                tooltipTitle: t('basis.label'),
            }}
            compareValue={guideline?.compare || 0}
            title={t('title')}
            total={guideline?.total || 0}
            totalProps={{
                label: t('total.label'),
                tooltipBody: t('total.tooltipBody'),
                tooltipTitle: t('total.label'),
            }}
        />
    );
};

export default GuidelineCard;
