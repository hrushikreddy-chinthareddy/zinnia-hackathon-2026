import { Policy } from '@zinnia/api-types/types/sor';
import {
    AssistiveText,
    AssistiveTextVariant,
    Loader,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useCallback, useState } from 'react';

import Radio from '@deps/components/radio/radio';
import { NotificationsTransactionData } from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab/bene-notification-tab.types';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useUpdateNotificationMethod } from '@deps/contexts/UpdateNotificationMethodContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { getCaseIdentifierValue } from '@deps/helpers/case-management';
import {
    deStringifyTrueFalseNull,
    isNullEmptyOrUndefined,
    stringifyTrueFalseNull,
} from '@deps/helpers/string.helpers';
import { CaseIdentifier } from '@deps/models/case/case';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { updateNotificationMethod } from '@deps/queries/api/web-non-financial';

import { buildUpdateNotificationMethodPayload } from './update-notification-method-helper';

type ContactEstablishedStepProps = {
    policy: Policy;
    transactionData: NotificationsTransactionData;
};

const ContactEstablishedStep = ({
    policy,
    transactionData,
}: ContactEstablishedStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'updateNotificationMethodForBeneficiary',
    });
    const [isLoading, setIsLoading] = useState(false);
    const {
        setContactEstablished,
        contactEstablished,
        setCaseId,
        setSubmitFailed,
        emailData,
        faxData,
        addressData,
        notificationMethodSelected,
    } = useUpdateNotificationMethod();
    const { goToNext } = useWorkflow();
    const [errors, setErrors] = useState<FormValidationErrors>();

    const caseId = getCaseIdentifierValue(
        transactionData?.identifiers || [],
        CaseIdentifier.ZlCaseId
    );

    const validateForm = useCallback(() => {
        if (isNullEmptyOrUndefined(contactEstablished)) {
            setErrors({
                ...errors,
                contactEstablished: t(
                    `contactEstablishedStep.formErrors.formValidation.contactEstablishedIsRequired`
                ),
            });
            return false;
        }
        return true;
    }, [contactEstablished, errors, t]);

    const submit = useCallback(async () => {
        setIsLoading(true);
        const payload = buildUpdateNotificationMethodPayload(
            policy,
            transactionData,
            emailData,
            faxData,
            addressData,
            notificationMethodSelected,
            contactEstablished
        );

        const successfulSubmit = await updateNotificationMethod(payload);
        if (successfulSubmit && successfulSubmit?.zlCaseId) {
            setCaseId(successfulSubmit?.zlCaseId);
            setSubmitFailed(false);
        } else {
            setCaseId('');
            setSubmitFailed(true);
        }
        setIsLoading(false);
    }, [
        policy,
        transactionData,
        emailData,
        faxData,
        addressData,
        notificationMethodSelected,
        contactEstablished,
        setCaseId,
        setSubmitFailed,
    ]);

    const handleStepContinue = useCallback(async () => {
        const isValid = validateForm();
        if (isValid) {
            if (contactEstablished) {
                await submit();
            }
            goToNext();
        } else {
            return;
        }
    }, [validateForm, contactEstablished, goToNext, submit]);

    const handleChangeRadio = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContactEstablished(
            deStringifyTrueFalseNull(e.target.value) as boolean
        );
        setErrors({});
    };

    const radioOptions = [
        {
            label: t(
                'contactEstablishedStep.contactEstablished.contactEstablishedRestartProcess'
            ),
            value: 'true',
        },
        {
            label: t(
                'contactEstablishedStep.contactEstablished.updateNotificationMethod'
            ),
            value: 'false',
        },
    ];

    return (
        <WorkflowCard
            title={t('contactEstablishedStep.title')}
            subtitle={''}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    handleContinue={handleStepContinue}
                    planCode={policy?.product?.planCode}
                    policyNumber={policy?.policyNumber}
                    parentPage={ParentPage.None}
                    leaveTransactionLink={`/cases/${caseId}/`}
                />
            }
        >
            <div>
                {isLoading && (
                    <div className="fixed left-0 top-0 z-10 flex h-screen w-screen justify-center bg-gray-800 opacity-80">
                        <Loader />
                    </div>
                )}
                <Typography variant={TypographyVariant.Body}>
                    {t('contactEstablishedStep.selectOption')}
                </Typography>
                <div className="mt-4">
                    <Radio
                        items={radioOptions}
                        value={stringifyTrueFalseNull(contactEstablished)}
                        disabled={false}
                        onChange={handleChangeRadio}
                        className="text-sm"
                        alignItems="items-stretch"
                    />
                </div>
                {errors?.contactEstablished ? (
                    <AssistiveText
                        text={errors.contactEstablished}
                        variant={AssistiveTextVariant.Error}
                        className="mt-2"
                    />
                ) : null}
            </div>
        </WorkflowCard>
    );
};

export default ContactEstablishedStep;
