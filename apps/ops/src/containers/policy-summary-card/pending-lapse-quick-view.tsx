import { FeatureType } from '@xd/api-types/dist/generated-types/sor';
import dayjs from 'dayjs';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';
import { DashboardContext } from '@deps/pages/policies';
import {
    DEFAULT_ERROR_STRING,
    DEFAULT_EXTENDED_DATE_FORMAT,
} from '@deps/types/constants';

import BaseDeathBenefit from './display-fields/base-death-benefit';
import UpcomingPremiumDisplayField from './display-fields/upcoming-premium';
import { getPolicyHighlighter, QuickViewRoot } from './policy-summary-card';

export const PendingLapseQuickView = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation([
        TranslationFiles.COMMON,
        TranslationFiles.COLDEFS,
    ]);
    const pendingLapse = policy.features.getFirstFeatureByType(
        FeatureType.LAPSEASSESSMENT
    );
    const { searchValue } = useContext(DashboardContext);

    return (
        <QuickViewRoot
            title={t('dashboard.search.results.policySummaryCard.header2')}
        >
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('colDefs:policySummary.gracePeriod')}
                    tooltipTitle={t('colDefs:policySummary.gracePeriod')}
                    tooltipBody={t('colDefs:policySummary.gracePeriodTooltip')}
                />
                <Content
                    details={`${dayjs(pendingLapse?.startDate).format(
                        DEFAULT_EXTENDED_DATE_FORMAT
                    )} - ${dayjs(pendingLapse?.endDate).format(
                        DEFAULT_EXTENDED_DATE_FORMAT
                    )}`}
                    variant={ContentVariant.BodySm}
                />
            </div>
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('colDefs:policySummary.gracePeriodMinPayment')}
                    tooltipTitle={t(
                        'colDefs:policySummary.gracePeriodMinPayment'
                    )}
                    tooltipBody={t(
                        'colDefs:policySummary.gracePeriodMinPaymentTooltip'
                    )}
                />
                <Content
                    details={numberFormatify(
                        pendingLapse?.totalMinimumRequiredAmount ||
                            DEFAULT_ERROR_STRING
                    )}
                    variant={ContentVariant.BodySm}
                    highlights={getPolicyHighlighter(searchValue)}
                />
            </div>
            <UpcomingPremiumDisplayField policy={policy} />
            <BaseDeathBenefit baseDeathBenefit={policy.baseDeathBenefit} />
        </QuickViewRoot>
    );
};
