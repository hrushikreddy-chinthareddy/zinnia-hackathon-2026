import { useTranslation } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';

import CorrespondenceCard from '@deps/containers/people-data-cards/correspondence-card/correspondence-card';
import { useCorrespondence } from '@deps/contexts/CorrespondenceContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import {
    Correspondence,
    CorrespondenceAction,
    CorrespondenceFormParts,
    domainValidation,
    emailRegex,
} from '@deps/models/case/correspondence';
import { CommunicationTypes, Confirm } from '@deps/models/case/send-document';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { ContactCenterTransactionType } from '@deps/types/segment-analytics';
import { browserLogWarn } from '@deps/utils/browser-logging';
import { isNonProductionEnvironment } from '@deps/utils/environment.helpers';
import { Policy } from '@zinnia/api-types/types/sor';

import AssistiveText, {
    AssistiveTextVariant,
} from '../assistive-text/assistive-text';
import { Loader } from '../page-loader';
import { RadioItem } from '../radio/radio';
import SendDocumentNavigationButtons from './action-components/navigation-buttons';
import WorkflowCard from '../workflows/workflow-card/workflow-card';

const getDefaultCommunicationType = (communicationOptions?: RadioItem[]) => {
    if (!communicationOptions) return '';
    const activeOptions = communicationOptions?.filter(
        (option) => option.disabled !== true
    );
    if (activeOptions?.length > 0) return activeOptions[0].value;
    return '';
};

export const validateEmail = (email: string) => {
    if (!emailRegex.test(email)) {
        return 'allFields.invalidEmail';
    }
    if (!domainValidation.test(email) && isNonProductionEnvironment()) {
        return 'allFields.invalidDomain';
    }
    return;
};

const validateEmailExist = (recipients: string[]) => {
    if (!recipients.length) {
        return 'allFields.emailRequired';
    }
    return false;
};

type CorrespondenceProps = {
    communicationOptions?: RadioItem[];
    policy: Policy;
    submitRequest: (val: CorrespondenceFormParts) => Promise<Confirm | null>;
};

const ContactCenterCorrespondence = ({
    policy,
    communicationOptions,
    submitRequest,
}: CorrespondenceProps) => {
    const { t } = useTranslation();
    const { setCurrentStepIndex, goToNext } = useWorkflow();
    const { state, dispatch } = useCorrespondence();
    const defaultCommunicationType =
        getDefaultCommunicationType(communicationOptions);

    const correspondenceData = useMemo(
        () => ({
            ...state?.correspondence,
            type: state?.correspondence?.type || defaultCommunicationType,
            recipients: state?.correspondence?.recipients,
        }),
        [defaultCommunicationType, state?.correspondence]
    );
    const [loader, setLoader] = useState(false);
    const [error, setError] = useState<FormValidationErrors>({});

    const handleCorrespondenceData = useCallback(
        (correspondenceData: Correspondence) => {
            dispatch({
                type: CorrespondenceAction.Correspondence,
                payload: correspondenceData,
            });
        },
        [dispatch]
    );

    const validRequest = () => {
        setError({});
        switch (correspondenceData.type) {
            case CommunicationTypes.Email: {
                const emailError = validateEmailExist(
                    correspondenceData?.recipients || []
                );
                if (emailError) {
                    browserLogWarn('contactCenterEmailValidation', {
                        contractNumber: policy?.policyNumber || '',
                        planCode: policy?.product?.planCode || '',
                        carrierId: policy?.carrierId || '',
                        payload: correspondenceData?.recipients || [],
                        error: t(emailError) ?? '',
                        function: 'correspondence.validateEmail',
                    });
                    setError({ ...error, submit: t(emailError) ?? '' });
                    return false;
                }
                break;
            }
            case CommunicationTypes.Mail:
                if (!state.correspondence?.mailDetails) {
                    setError({
                        ...error,
                        submit: t('allFields.selectAddressToContinue') ?? '',
                    });
                    return false;
                }

                break;
            default:
                if (!state.correspondence.recipients.length) {
                    setError({
                        ...error,
                        submit:
                            t('allFields.recipientRequiredToContinue') ?? '',
                    });
                    return false;
                }
        }
        return Object.keys(error).length === 0;
    };

    const handleContinue = async () => {
        if (!validRequest()) {
            return;
        }

        try {
            setLoader(true);

            const normalizedState = {
                ...state,
                correspondence: {
                    ...state.correspondence,
                    recipients:
                        state.correspondence?.type === 'Email'
                            ? state.correspondence?.recipients?.map((email) =>
                                  email?.toLowerCase().trim()
                              ) || []
                            : state.correspondence?.recipients ?? [],
                },
            };

            const response = await submitRequest(normalizedState);

            setLoader(false);
            dispatch({
                type: CorrespondenceAction.Confirm,
                payload: {
                    ...state.confirm,
                    ...response,
                },
            });

            await goToNext();
        } catch (e: any) {
            setLoader(false);
            setError({ submit: e?.message as string });
        }
    };

    const handleCancel = () => {
        dispatch({
            type: CorrespondenceAction.Reset,
        });
        setCurrentStepIndex(0);
    };

    return (
        <WorkflowCard
            title={t(`allFields.correspondence`)}
            footerContent={
                <SendDocumentNavigationButtons
                    handleContinue={handleContinue}
                    handleCancel={handleCancel}
                    trackEventProps={{
                        type: ContactCenterTransactionType.CORRESPONDENCE,
                    }}
                />
            }
        >
            <CorrespondenceCard
                setCorrespondenceData={handleCorrespondenceData}
                communicationOptions={communicationOptions}
                correspondenceData={correspondenceData}
                error={error}
                policy={policy}
                showAdditionalRecipient={true}
                setError={setError}
            />
            {loader && <Loader />}
            {error?.submit && (
                <AssistiveText
                    text={error?.submit}
                    variant={AssistiveTextVariant.Error}
                    className="mt-2"
                />
            )}
        </WorkflowCard>
    );
};

export default ContactCenterCorrespondence;
