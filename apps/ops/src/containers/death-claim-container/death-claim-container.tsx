import { PartyRole, Policy } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';

import { RadioItem } from '@deps/components/radio/radio';
import { TranslationFiles } from '@deps/config/translations';
import { getCommunicationTypes } from '@deps/containers/death-claim-container/death-claim.helpers';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import TabGroupContainer from '@deps/containers/tab-group-container/tab-group';
import { useDeathClaim } from '@deps/contexts/DeathClaimContext';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';

import { RoleType } from './death-claim.types';
import ConfirmStep from './steps/confirm/confirm-step';
import { DeathClaimNotificationStep } from './steps/death-claim-notifier/death-claim-notifier-step';
import NotificationMethodStep from './steps/notification-method/notification-method.step';

interface DeathClaimContainerProps {
    policy: Policy;
}

const DeathClaimContainer = ({ policy }: DeathClaimContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'deathClaims' });
    const { notifiers } = useDeathClaim();

    const communicationTypes = useMemo(() => getCommunicationTypes(t), [t]);
    const [communicationOptions] = useState<RadioItem[]>(communicationTypes);
    const [showNotificationMethod, setShowNotificationMethod] = useState<boolean>(true);

    useEffect(() => {
        if (notifiers?.notifierRole === RoleType.Other) {
            setShowNotificationMethod(false);
        } else if (notifiers.isPrimaryBeneInfoOnFile === true) {
            setShowNotificationMethod(false);
        } else if (notifiers.notifierRole === RoleType.Beneficiary) {
            if (notifiers?.party.partyRole !== PartyRole.PRIMARYBENEFICIARY) {
                setShowNotificationMethod(false);
            } else {
                setShowNotificationMethod(true);
            }
        } else {
            setShowNotificationMethod(true);
        }
    }, [notifiers.isPrimaryBeneInfoOnFile, notifiers.notifierRole, notifiers?.party.partyRole]);

    const steps = useMemo(
        () => [
            {
                ariaLabel: t('tabs.deathClaimNotification'),
                isVisible: () => true,
                component: <DeathClaimNotificationStep policy={policy} showNotification={showNotificationMethod} />,
                screenReaderLabel: t('tabs.deathClaimNotification'),
                index: 0,
                text: t('tabs.deathClaimNotification'),
            },
            {
                ariaLabel: t('tabs.notificationMethod'),
                isVisible: () => showNotificationMethod,
                component: <NotificationMethodStep communicationOptions={communicationOptions} policy={policy} />,
                screenReaderLabel: t('tabs.notificationMethod'),
                index: 1,
                text: t('tabs.notificationMethod'),
            },
            {
                ariaLabel: t('tabs.confirm'),
                isVisible: () => true,
                component: <ConfirmStep policy={policy} />,
                screenReaderLabel: t('tabs.confirm'),
                index: 2,
                text: t('tabs.confirm'),
            },
        ],
        [t, policy, communicationOptions, showNotificationMethod]
    );

    const filteredSteps: Step[] = useMemo(
        () => steps.filter((item: any) => item.isVisible?.()).map((item: any, index: number) => ({ ...item, index })),
        [steps]
    );

    return <TabGroupContainer steps={filteredSteps} policy={new PolicyDetails(policy)}></TabGroupContainer>;
};

export default DeathClaimContainer;
