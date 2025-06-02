import { Policy } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import * as React from 'react';

import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';

import BeneficiarySummary from './beneficiary-summary';
import SummaryOverview from './summary-overview';
import { useBeneChange } from '../../../bene-change-provider';

interface SummaryStepProps {
    policy: Policy;
}

const SummaryStep = (props: SummaryStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'beneChange.summary' });
    const { goToNext } = useWorkflow();
    const { formErrors, setFormErrors } = useBeneChange();
    const handleStepContinue = React.useCallback(() => {
        goToNext();
    }, [formErrors, props.policy, setFormErrors, goToNext]);

    return (
        <WorkflowCard
            title={t('header')}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-10"
                    disableContinue={false}
                    handleContinue={handleStepContinue}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink="/create-case"
                />
            }
        >
            <p className="mb-3 font-primary text-sm">{t('reviewMessage')}</p>
            <SummaryOverview />
            <BeneficiarySummary />
        </WorkflowCard>
    );
};

export default SummaryStep;
