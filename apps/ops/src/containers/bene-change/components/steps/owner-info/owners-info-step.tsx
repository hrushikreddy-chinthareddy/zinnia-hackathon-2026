import { Policy } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import * as React from 'react';

import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { Carrier } from '@deps/models/case/withdrawal/case';

import {
    getConfigFlic,
    getConfigMass,
    getConfigSbgc,
} from './owner-info.helpers';
import OwnerInformation from './owner-information';
import { useBeneChange } from '../../../bene-change-provider';

interface OwnersInfoStepProps {
    policy: Policy;
    parentPage: ParentPage;
    leaveTransactionLink: string;
}

const OwnersInfoStep = ({
    policy,
    parentPage,
    leaveTransactionLink,
}: OwnersInfoStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.ownerInfo',
    });
    let formConfigs;
    const { goToNext } = useWorkflow();
    const { formErrors, setFormErrors } = useBeneChange();

    if (policy.carrierId === Carrier.MASS) {
        formConfigs = getConfigMass(t);
    } else if (policy.carrierId === Carrier.SBGC) {
        formConfigs = getConfigSbgc(t);
    } else {
        // if (policy.carrierId === Carrier.FLIC) {
        formConfigs = getConfigFlic(t);
    }

    const { formPartyConfigs } = formConfigs || {};

    const handleStepContinue = React.useCallback(() => {
        goToNext();
    }, [formErrors, setFormErrors]);

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
            footerClassName={'pt-0'}
        >
            <OwnerInformation
                isFormStateReadOnly={false}
                configs={formPartyConfigs as any}
                policy={policy}
            />
        </WorkflowCard>
    );
};

export default OwnersInfoStep;
