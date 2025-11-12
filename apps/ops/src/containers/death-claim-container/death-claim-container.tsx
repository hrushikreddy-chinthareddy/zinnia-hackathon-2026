import { PartyRole, Policy } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';

import { PROCESS_WITHOUT_CASE_DOCUMENT } from '@deps/components/case-document-select/case-document-select';
import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { RadioItem } from '@deps/components/radio/radio';
import { TranslationFiles } from '@deps/config/translations';
import { getCommunicationTypes } from '@deps/containers/death-claim-container/death-claim.helpers';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import TabGroupContainer from '@deps/containers/tab-group-container/tab-group';
import { useDeathClaim } from '@deps/contexts/DeathClaimContext';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { useDeathClaimSupportingDocument } from '@deps/hooks/useDeathClaimSupportingDocument';
import { UserProfile } from '@deps/models/user-profile';
import { browserLogInfo } from '@deps/utils/browser-logging';

import { RoleType } from './death-claim.types';
import DocumentSelectionModal from './document-selection/document-selection-modal';
import ConfirmStep from './steps/confirm/confirm-step';
import { DeathClaimNotificationStep } from './steps/death-claim-notifier/death-claim-notifier-step';
import NotificationMethodStep from './steps/notification-method/notification-method.step';

interface DeathClaimContainerProps {
    policy: Policy;
    user: UserProfile;
}

const DeathClaimContainer = ({ policy, user }: DeathClaimContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'deathClaims',
    });
    const {
        notifiers,
        isDocumentSelected,
        setOnbaseCaseId,
        setOnbaseDocumentNumber,
    } = useDeathClaim();

    const communicationTypes = useMemo(() => getCommunicationTypes(t), [t]);
    const [communicationOptions] = useState<RadioItem[]>(communicationTypes);
    const [showNotificationMethod, setShowNotificationMethod] =
        useState<boolean>(true);
    const { supportingDocuments, isLoading } = useDeathClaimSupportingDocument(
        policy.carrierId as string,
        policy.policyNumber as string
    );

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
    }, [
        notifiers.isPrimaryBeneInfoOnFile,
        notifiers.notifierRole,
        notifiers?.party.partyRole,
    ]);

    useEffect(() => {
        if (!isLoading) {
            const supportingDocumentsLength = supportingDocuments.length;
            if (supportingDocumentsLength === 0) {
                setOnbaseDocumentNumber(PROCESS_WITHOUT_CASE_DOCUMENT);
                setOnbaseCaseId(PROCESS_WITHOUT_CASE_DOCUMENT);
                browserLogInfo(
                    'deathClaimContainer::No supporting document found, set process without document option.',
                    {
                        lob: policy.carrierId,
                        policyNumber: policy.policyNumber,
                        documentListCount: supportingDocumentsLength,
                    }
                );
            }
            if (supportingDocumentsLength === 1) {
                setOnbaseDocumentNumber(supportingDocuments[0].documentNumber);
                setOnbaseCaseId(supportingDocuments[0].caseId);
                browserLogInfo(
                    'deathClaimContainer::Single supporting document found, set process with a document option.',
                    {
                        lob: policy.carrierId,
                        policyNumber: policy.policyNumber,
                        documentListCount: supportingDocumentsLength,
                        documentNumber: supportingDocuments[0].documentNumber,
                        caseId: supportingDocuments[0].caseId,
                    }
                );
            }
        }
    }, [
        supportingDocuments,
        isLoading,
        setOnbaseDocumentNumber,
        setOnbaseCaseId,
        policy.carrierId,
        policy.policyNumber,
    ]);

    const steps = useMemo(
        () => [
            {
                ariaLabel: t('tabs.deathClaimNotification'),
                isVisible: () => true,
                component: (
                    <DeathClaimNotificationStep
                        policy={policy}
                        showNotification={showNotificationMethod}
                        user={user}
                    />
                ),
                screenReaderLabel: t('tabs.deathClaimNotification'),
                index: 0,
                text: t('tabs.deathClaimNotification'),
            },
            {
                ariaLabel: t('tabs.notificationMethod'),
                isVisible: () => showNotificationMethod,
                component: (
                    <NotificationMethodStep
                        communicationOptions={communicationOptions}
                        policy={policy}
                        user={user}
                    />
                ),
                screenReaderLabel: t('tabs.notificationMethod'),
                index: 1,
                text: t('tabs.notificationMethod'),
            },
            {
                ariaLabel: t('tabs.confirm'),
                isVisible: () => true,
                component: <ConfirmStep policy={policy} user={user} />,
                screenReaderLabel: t('tabs.confirm'),
                index: 2,
                text: t('tabs.confirm'),
            },
        ],
        [t, policy, showNotificationMethod, user, communicationOptions]
    );

    const filteredSteps: Step[] = useMemo(
        () =>
            steps
                .filter((item: any) => item.isVisible?.())
                .map((item: any, index: number) => ({ ...item, index })),
        [steps]
    );

    if (isLoading) {
        return (
            <div className="fixed left-0 top-0 z-10 flex h-screen w-screen justify-center bg-gray-800 opacity-80">
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );
    }

    if (!isDocumentSelected && supportingDocuments.length > 1) {
        return (
            <DocumentSelectionModal
                supportingDocuments={supportingDocuments}
                policyNumber={policy.policyNumber as string}
                lob={policy.carrierId as string}
            />
        );
    } else {
        return (
            <TabGroupContainer
                steps={filteredSteps}
                policy={new PolicyDetails(policy)}
            ></TabGroupContainer>
        );
    }
};

export default DeathClaimContainer;
