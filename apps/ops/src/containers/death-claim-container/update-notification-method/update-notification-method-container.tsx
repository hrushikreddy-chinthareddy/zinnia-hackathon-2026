import { Policy } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import { NotificationsTransactionData } from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab/bene-notification-tab.types';
import { TranslationFiles } from '@deps/config/translations';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import TabGroupContainer from '@deps/containers/tab-group-container/tab-group';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';

import ConfirmStep from './confirm-step';
import UpdateNotificationMethodStep from './update-notification-method-step';

type UpdateNotificationMethodContainerProps = {
    transactionData: NotificationsTransactionData;
    policy: Policy;
};

const UpdateNotificationMethodContainer = ({
    transactionData,
    policy,
}: UpdateNotificationMethodContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'updateNotificationMethodForBeneficiary',
    });

    const steps = useMemo(
        () => [
            {
                ariaLabel: t('tabs.updateNotificationMethod'),
                isVisible: () => true,
                screenReaderLabel: t('tabs.updateNotificationMethod'),
                component: (
                    <UpdateNotificationMethodStep
                        policy={policy}
                        transactionData={transactionData}
                    />
                ),
                index: 0,
                text: t('tabs.updateNotificationMethod'),
            },
            {
                ariaLabel: t('tabs.confirm'),
                isVisible: () => true,
                component: (
                    <ConfirmStep
                        policy={policy}
                        transactionData={transactionData}
                    />
                ),
                screenReaderLabel: t('tabs.confirm'),
                index: 1,
                text: t('tabs.confirm'),
            },
        ],
        [policy, t, transactionData]
    );

    const filteredSteps: Step[] = useMemo(
        () =>
            steps
                .filter((item: any) => item.isVisible?.())
                .map((item: any, index: number) => ({ ...item, index })),
        [steps]
    );

    return (
        <TabGroupContainer
            steps={filteredSteps}
            policy={new PolicyDetails(policy)}
        ></TabGroupContainer>
    );
};
export default UpdateNotificationMethodContainer;
