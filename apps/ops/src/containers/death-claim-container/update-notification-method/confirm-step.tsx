import { Policy } from "@zinnia/api-types/types/sor";
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import { NotificationsTransactionData } from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab.types';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { useUpdateNotificationMethod } from '@deps/contexts/UpdateNotificationMethodContext';
import { updateNotificationMethod } from '@deps/queries/api/web-non-financial';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

import { buildUpdateNotificationMethodPayload } from './update-notification-method-helper';

interface ConfirmStepProps {
  policy: Policy,
  transactionData: NotificationsTransactionData
};

const ConfirmStep = ({ policy, transactionData }: ConfirmStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'updateNotificationMethodForBeneficiary.confirmStep' });
    const router = useRouter();
    const { submitFailed, setSubmitFailed, setCaseId, caseId, emailData, faxData, addressData, notificationMethodSelected } = useUpdateNotificationMethod();
    const [isLoading, setIsLoading] = useState(false);

    const submit = useCallback(async () => {
      setIsLoading(true);
      const payload = buildUpdateNotificationMethodPayload(policy, transactionData, emailData, faxData, addressData, notificationMethodSelected);
      console.log(payload);

      const successfulSubmit = await updateNotificationMethod(payload);

      if (successfulSubmit && successfulSubmit?.zlCaseId) {
        setCaseId(successfulSubmit?.zlCaseId);
        setSubmitFailed(false);
      } else {
        setCaseId('')
        setSubmitFailed(true);
      }
      setIsLoading(false);
    }, [policy, transactionData, emailData, faxData, addressData, notificationMethodSelected, setCaseId, setSubmitFailed]);

    if (isLoading) {
        return (
            <div className="responsive-padding flex h-[300px] w-full grow">
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );
    }

    if (submitFailed) {
        return (
            <ApiErrorCard
                leaveRoute={'/create-case'}
                submit={{
                    action: submit,
                    text: t('updateNotificationMethod'),
                }}
            />
        );
    }

    return (
        <div className="responsive-padding flex h-full w-full grow flex-col items-center justify-center">
            <CardInfo
                icon={<CircleCheckIcon className="text-semantic-success" height={50} width={50} />}
                subtitle={t('subTitle', { caseId: caseId})}
                title={t('title')}
                cta={{
                    action: () => {
                        router.push(`/cases/${caseId}/progress`);
                    },
                    text: t('cta'),
                }}
                secondaryCta={
                    <NavElement
                        aria-label={t('secondaryCta') as string}
                        onClick={() =>
                            router.push(`/policies/${policy.product?.planCode}/${policy.policyNumber}`)
                        }
                        size={NavElementSize.Small}
                        type={NavElementType.Button}
                        variant={NavElementVariant.Default}
                    >
                        {t('secondaryCta')}
                    </NavElement>
                }
            />
        </div>
    );
};

export default ConfirmStep;

