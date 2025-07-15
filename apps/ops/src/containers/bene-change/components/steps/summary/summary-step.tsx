import { Policy } from '@zinnia/api-types/types/sor';
import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { useState, useMemo } from 'react';

import BannerAlert, {
    BannerVariant,
} from '@deps/components/banner-alert/banner-alert';
import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';

import BeneficiarySummary from './beneficiary-summary';
import SummaryOverview from './summary-overview';
import { useBeneChange } from '../../../bene-change-provider';

interface SummaryStepProps {
    policy: Policy;
    parentPage: ParentPage;
    leaveTransactionLink: string;
}

const SummaryStep = ({
    policy,
    parentPage,
    leaveTransactionLink,
}: SummaryStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.summary',
    });
    const { goToNext } = useWorkflow();
    const { formErrors, setFormErrors, validationResponse } = useBeneChange();
    const [isChecked, setIsChecked] = useState<boolean>(false);

    const validationSucceeded = useMemo(
        () => validationResponse?.status === TransactionResponseStatus.Success,
        [validationResponse]
    );

    const handleStepContinue = React.useCallback(() => {
        if (!validationSucceeded && !isChecked) {
            setShowSelectionError(true);
            return;
        } else {
            setShowSelectionError(false);
            goToNext();
        }
    }, [
        formErrors,
        policy,
        setFormErrors,
        goToNext,
        isChecked,
        validationSucceeded,
    ]);

    const [showSelectionError, setShowSelectionError] =
        useState<boolean>(false);

    return (
        <WorkflowCard
            title={t('header')}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-10"
                    disableContinue={false}
                    handleContinue={handleStepContinue}
                    parentPage={parentPage}
                    leaveTransactionLink={leaveTransactionLink}
                />
            }
        >
            <p className="mb-3 font-primary text-sm">
                {validationSucceeded
                    ? t('reviewMessage')
                    : t('status400subtitle')}
            </p>
            <SummaryOverview />
            <BeneficiarySummary />
            {!validationSucceeded && (
                <div className="mt-10 flex flex-col gap-6">
                    {validationResponse?.validationResult ? (
                        validationResponse?.validationResult?.map(
                            (validationResult) => {
                                const { error, errorCode, resolution } =
                                    validationResult;
                                return (
                                    <BannerAlert
                                        canDismiss={false}
                                        key={`bpm-validation-banner-${errorCode}`}
                                        variant={BannerVariant.Error}
                                    >
                                        <b>{error}</b> {resolution}
                                    </BannerAlert>
                                );
                            }
                        )
                    ) : (
                        <BannerAlert
                            canDismiss={false}
                            variant={BannerVariant.Error}
                        >
                            <b>{t('bpm500Error')}</b>
                        </BannerAlert>
                    )}
                    <div className="flex flex-row">
                        <CheckboxText
                            label={t('submitWithErrorsText')}
                            checked={isChecked}
                            onChange={() => setIsChecked(!isChecked)}
                        />
                    </div>
                </div>
            )}
            {showSelectionError && !isChecked && (
                <AssistiveText
                    className="mt-2"
                    variant={AssistiveTextVariant.Error}
                    text={t('missingCheckToConfirm')}
                />
            )}
        </WorkflowCard>
    );
};

export default SummaryStep;
