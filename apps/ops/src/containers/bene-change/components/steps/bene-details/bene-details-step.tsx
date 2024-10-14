import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import * as React from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { Policy } from '@deps/models/policy/sor-policy';

import { validateBeneData } from './bene-details-step.helper';
import { useBeneChange } from '../../../bene-change-provider';
import BeneficiaryListing from '../../beneficiary-details/beneficiary-listing/beneficiary-listing';

interface BeneDetailsStepProps {
    policy: Policy;
}

const BeneDetailsStep = ({ policy }: BeneDetailsStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'beneChange.beneDetails' });
    const { carrierId } = policy;
    const { goToNext } = useWorkflow();
    const { peopleSelection, beneData, formErrors, setFormErrors, } = useBeneChange();

    const handleStepContinue = useCallback(() => {
        const formErrors = validateBeneData(beneData, t);
        if (Object.keys(formErrors).length > 0) {
            setFormErrors(formErrors);
        } else {
            goToNext();
        }
    }, [beneData, t, setFormErrors, goToNext]);

    return (
        <WorkflowCard
            title={t('header')}
            footerContent={
                <TransactionNavigationButtons
                    disableContinue={false}
                    handleContinue={handleStepContinue}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink="/create-case"
                />
            }
        >
            <BeneficiaryListing
                parties={peopleSelection?.cardActionData?.filteredData || []}
                carrierId={carrierId as string}
                policy={policy}
            />
            {formErrors.firstNamesRequired
                ? (
                    <AssistiveText
                        text={formErrors.firstNamesRequired}
                        variant={AssistiveTextVariant.Error}
                        className="mt-2"
                    />
                ) : null
            }
             {formErrors.addressesRequired
                ? (
                    <AssistiveText
                        text={formErrors.addressesRequired}
                        variant={AssistiveTextVariant.Error}
                        className="mt-2"
                    />
                ) : null
            }
        </WorkflowCard>
    );
};

export default BeneDetailsStep;
