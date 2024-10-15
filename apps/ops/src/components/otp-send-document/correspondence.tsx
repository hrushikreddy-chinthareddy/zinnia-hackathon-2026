import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';

import CorrespondenceCard from '@deps/containers/people-data-cards/correspondence-card/correspondence-card';
import { useCorrespondence } from '@deps/contexts/CorrespondenceContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { isNonProductionEnvironment } from '@deps/helpers/environment.helper';
import { Correspondence, CorrespondenceAction, CorrespondenceFormParts } from '@deps/models/case/correspondence';
import { CommunicationTypes, Confirm } from '@deps/models/case/send-document';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { Policy } from '@deps/models/policy/sor-policy';

import SendDocumentNavigationButtons from './action-components/navigation-buttons';
import AssistiveText, { AssistiveTextVariant } from '../assistive-text/assistive-text';
import { Loader } from '../page-loader';
import { RadioItem } from '../radio/radio';
import WorkflowCard from '../workflows/workflow-card/workflow-card';

const getDefaultCommunicationType = (communicationOptions?: RadioItem[]) => {
    if (!communicationOptions) return '';
    const activeOptions = communicationOptions?.filter(option => option.disabled !== true);
    if (activeOptions?.length > 0) return activeOptions[0].value;
    return '';
};
type CorrespondenceProps = {
    communicationOptions?: RadioItem[];
    policy: Policy;
    submitRequest: (val: CorrespondenceFormParts) => Promise<Confirm | null>;
};
const ContactCenterCorrespondence = ({ policy, communicationOptions, submitRequest }: CorrespondenceProps) => {
    const domainValidation = new RegExp(/^[a-z0-9](\.?[a-z0-9]){3,}@zinnia\.com$/);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument' });
    const { setCurrentStepIndex, goToNext } = useWorkflow();
    const { state, dispatch } = useCorrespondence();
    const defaultCommunicationType = getDefaultCommunicationType(communicationOptions);

    const [correspondenceData, setCorrespondenceData] = useState<Correspondence>({
        ...state?.correspondence,
        type: state?.correspondence?.type || defaultCommunicationType,
        recipient: state?.correspondence?.recipient,
    });
    const [loader, setLoader] = useState(false);
    const [error, setError] = useState<FormValidationErrors>({});

    useEffect(() => {
        dispatch({
            type: CorrespondenceAction.Correspondence,
            payload: {
                ...state.correspondence,
                ...correspondenceData,
            },
        });
    }, [correspondenceData]);

    const validRequest = () => {
        switch (correspondenceData.type) {
            case CommunicationTypes.Email:
                if (!emailRegex.test(correspondenceData.recipient)) {
                    setError({ ...error, email: t('errors.inValidEmail') as string });
                    return false;
                }
                if (!domainValidation.test(correspondenceData.recipient) && isNonProductionEnvironment()) {
                    setError({ ...error, email: t('errors.inValidDomain') as string });
                    return false;
                }
                break;
            case CommunicationTypes.Mail:
                if (!state.correspondence?.mailDetails) {
                    setError({ ...error, submit: t('errors.mailDetails') as string });
                    return false;
                }
                setError({ ...error, submit: '' });
                break;
            default:
                if (!state.correspondence.recipient) {
                    setError({ ...error, submit: t('errors.recipient') as string });
                    return false;
                }
                setError({ ...error, submit: '' });
        }

        return true;
    };

    const handleContinue = async () => {
        if (!validRequest()) {
            return;
        }

        try {
            setLoader(true);

            const response = await submitRequest(state);
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
            setError({ ...error, submit: e?.message as string });
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
            title={t(`tabs.correspondence`)}
            footerContent={<SendDocumentNavigationButtons handleContinue={handleContinue} handleCancel={handleCancel} />}
        >
            {loader && <Loader />}
            <CorrespondenceCard
                setCorrespondenceData={setCorrespondenceData}
                communicationOptions={communicationOptions}
                correspondenceData={correspondenceData}
                error={error}
                policy={policy}
            />
            {error?.submit && <AssistiveText text={error?.submit} variant={AssistiveTextVariant.Error} className="mt-2" />}
        </WorkflowCard>
    );
};

export default ContactCenterCorrespondence;
