import {
    AssistiveText,
    AssistiveTextVariant,
    Loader,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { RadioItem } from '@deps/components/radio/radio';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { buildClaimPayload } from '@deps/containers/death-claim-container/death-claim.helpers';
import { getBeneficiariesByRole } from '@deps/containers/death-claim-container/steps/notification-method/notification-method.helpers';
import { useDeathClaim } from '@deps/contexts/DeathClaimContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { UserProfile } from '@deps/models/user-profile';
import { submitDeathClaim } from '@deps/queries/api/web-non-financial';
import { browserLogInfo } from '@deps/utils/browser-logging';
import { PartyRole, Policy } from '@zinnia/api-types/types/sor';

import NotificationCard from './notification-card';
import {
    ClaimCommunicationTypes,
    NotificationMethod,
    RoleType,
} from '../../death-claim.types';

type NotificationMethodStepProps = {
    communicationOptions: RadioItem[];
    policy: Policy;
    user: UserProfile;
    correlationId: string;
};

const NotificationMethodStep = ({
    policy,
    communicationOptions,
    user,
    correlationId,
}: NotificationMethodStepProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'deathClaims.notificationMethod',
    });
    const {
        beneficiaries,
        setBeneficiaries,
        notifiers,
        owners,
        setSubmitFailed,
        setCaseId,
        formErrors,
        onbaseCaseId,
        onbaseDocumentNumber,
        caseId,
    } = useDeathClaim();
    const { goToNext } = useWorkflow();
    const [isLoading, setIsLoading] = useState(false);

    const policyBeneficiaries: NotificationMethod[] = useMemo(() => {
        const isPrimaryBeneSelected =
            notifiers.notifierRole === RoleType.Beneficiary &&
            notifiers.party.partyRole == PartyRole.PRIMARYBENEFICIARY;
        const beneList = getBeneficiariesByRole(policy, [
            PartyRole.PRIMARYBENEFICIARY,
        ]);
        if (isPrimaryBeneSelected) {
            return beneList.filter(
                (bene) => bene.party.partyId === notifiers.party.partyId
            );
        } else {
            return beneList;
        }
    }, [policy, notifiers]);

    useEffect(() => {
        if (beneficiaries.length === 0) {
            setBeneficiaries(policyBeneficiaries);
        }
    }, [beneficiaries.length, policyBeneficiaries, setBeneficiaries]);

    const handleNotification = (data: any, index: number) => {
        setBeneficiaries((prevState) => {
            const newState = prevState;
            newState[index] = {
                ...newState[index],
                ...data,
            };
            return newState;
        });
    };

    const submit = useCallback(async () => {
        if (caseId) {
            browserLogInfo('NotificationMethodStep::Claim already submitted', {
                caseId,
                policy: policy?.policyNumber,
            });
            return;
        }
        setIsLoading(true);
        const payload = buildClaimPayload({
            policy: policy,
            document: null,
            selNotifiers: notifiers,
            selOwners: owners,
            selBeneficiaries: beneficiaries,
            onbaseCaseId: onbaseCaseId,
            onbaseDocumentNumber: onbaseDocumentNumber,
            user: user,
            correlationId: correlationId,
        });

        browserLogInfo('NotificationMethodStep::Submit claim payload', {
            payload,
            policy: policy?.policyNumber,
        });
        const successfulSubmit = await submitDeathClaim(payload);

        if (successfulSubmit && successfulSubmit?.zlCaseId) {
            setCaseId(successfulSubmit?.zlCaseId);
            setSubmitFailed(false);
        } else {
            setCaseId('');
            setSubmitFailed(true);
        }

        setIsLoading(false);
    }, [
        beneficiaries,
        caseId,
        correlationId,
        notifiers,
        onbaseCaseId,
        onbaseDocumentNumber,
        owners,
        policy,
        setCaseId,
        setSubmitFailed,
        user,
    ]);

    const handleStepContinue = useCallback(async () => {
        const asArray = Object.entries(formErrors);
        const filterCb = asArray.filter(
            ([key, value]) => value !== '' || key === 'submit'
        );
        const filteredErrors = Object.fromEntries(filterCb);
        if (Object.keys(filteredErrors).length > 0) {
            return;
        } else {
            await submit();
            goToNext();
        }
    }, [formErrors, goToNext, submit]);

    return (
        <WorkflowCard
            title={t('title')}
            subtitle={t('subTitle') as string}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    handleContinue={handleStepContinue}
                    planCode={policy?.product?.planCode}
                    policyNumber={policy?.policyNumber}
                    parentPage={ParentPage.None}
                />
            }
        >
            <div className="flex flex-col gap-2">
                <div className="my-2">
                    <Typography variant={TypographyVariant.LabelLg}>
                        {t('notificationMethod')}
                    </Typography>
                </div>
                {isLoading && (
                    <div className="fixed left-0 top-0 z-10 flex h-screen w-screen justify-center bg-gray-800 opacity-80">
                        <Loader />
                    </div>
                )}
                {beneficiaries &&
                    beneficiaries?.map((party, index) => {
                        return (
                            <NotificationCard
                                key={`notification-card-${index}`}
                                communicationOptions={communicationOptions}
                                policy={policy}
                                party={party}
                                index={index}
                                handleNotification={handleNotification}
                                defaultCommunicationType={
                                    ClaimCommunicationTypes.Email
                                }
                                policyBeneficiaries={policyBeneficiaries}
                            />
                        );
                    })}
                {beneficiaries && beneficiaries.length === 0 && (
                    <AssistiveText
                        className="my-lg"
                        variant={AssistiveTextVariant.Info}
                        text={t('noBeneficiaries') as string}
                    />
                )}
            </div>
        </WorkflowCard>
    );
};

export default NotificationMethodStep;
