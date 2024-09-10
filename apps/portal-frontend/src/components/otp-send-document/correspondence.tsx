import { UserProfile } from '@auth0/nextjs-auth0/client';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';

import { useSendDocument } from '@deps/contexts/SendDocumentContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import {
    CommunicationTypes,
    SendCommunicationRequestBody,
    SendDocumentAction,
    SendDocumentFormParts,
} from '@deps/models/case/send-document';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { PartyRole, PartyType, Policy } from '@deps/models/policy/sor-policy';
import { sendCommunication } from '@deps/queries/api/c2web';

import SendDocumentNavigationButtons from './action-components/navigation-buttons';
import ContactCenterAddress from './components/contact-address';
import EmailAddress from './components/email-field';
import FaxNumber from './components/fax-field';
import AssistiveText, { AssistiveTextVariant } from '../assistive-text/assistive-text';
import { Loader } from '../page-loader';
import Radio, { RadioItem } from '../radio/radio';
import WorkflowCard from '../workflows/workflow-card/workflow-card';

const getPrimaryEmail = (policy: Policy) => {
    // TODO MG: `PartyRole.EDELIVERY` isnt in the new spec - this was manually added
    const eDeliveryRoleId = policy.partyRoles?.find(party => party.partyRole === PartyRole.EDELIVERY)?.partyId;
    const primaryEmails =
        policy.parties?.find(policy => policy.partyType === PartyType.INDIVIDUAL && policy.partyId === eDeliveryRoleId)?.emails || [];
    return primaryEmails?.length > 0 ? primaryEmails[0].emailAddress || '' : '';
};

const generateCommunicationRequest = (
    policy: Policy,
    communicationType: string,
    state: SendDocumentFormParts,
    user: UserProfile,
    ctiCallNumber: string,
    correlationId: string
): SendCommunicationRequestBody => {
    return {
        contractNumber: policy.policyNumber || '',
        planCode: policy.product?.planCode || '',
        carrier: policy?.carrierId || '',
        ctiCallNumber,
        type: communicationType,
        recipient: state.correspondence.recipient,
        correlationId,
        productName: policy.product?.lineOfBusiness || '',
        qualType: policy.qualificationType || '',
        status: policy?.policyStatus || '',
        issueState: policy?.issueState || '',
        issueDate: policy?.policyDates?.issueDate || '',
        mailDetails: communicationType === CommunicationTypes.Mail ? state.correspondence?.mailDetails : undefined,
        createdBy: user.email || '',
    };
};
type CorrespondenceProps = {
    communicationOptions?: RadioItem[];
    policy: Policy;
    ctiCallNumber: string;
    correlationId: string;
    user: UserProfile;
};
const Correspondence = ({ policy, ctiCallNumber, correlationId, user, communicationOptions }: CorrespondenceProps) => {
    const domainValidation = new RegExp(/^[a-z0-9](\.?[a-z0-9]){3,}@zinnia\.com$/);

    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument' });
    const { setCurrentStepIndex, goToNext } = useWorkflow();
    const { state, dispatch } = useSendDocument();

    const emailId = getPrimaryEmail(policy);
    const [communicationType, setCommunicationType] = useState(state?.correspondence?.type || CommunicationTypes.Email);
    const [email, setEmail] = useState(
        state?.correspondence?.type === CommunicationTypes.Email ? state?.correspondence?.recipient || emailId : ''
    );
    const [fax, setFax] = useState(state?.correspondence?.type === CommunicationTypes.Fax ? state?.correspondence?.recipient : '');
    const [loader, setLoader] = useState(false);
    const [error, setError] = useState<FormValidationErrors>({});
    const formId = state?.document?.selected?.formId || '';

    const communicationTypes = [
        {
            label: t('correspondence.email'),
            value: CommunicationTypes.Email,
        },
        {
            label: t('correspondence.fax'),
            value: CommunicationTypes.Fax,
        },
        {
            label: t('correspondence.mail'),
            value: CommunicationTypes.Mail,
        },
    ];

    useEffect(() => {
        dispatch({
            type: SendDocumentAction.Correspondence,
            payload: {
                ...state.correspondence,
                type: communicationType,
                recipient: communicationType === CommunicationTypes.Email ? email : fax,
            },
        });
    }, [communicationType, email, fax]);

    const validRequest = () => {
        switch (communicationType) {
            case CommunicationTypes.Email:
                if (!domainValidation.test(email) && !(process.env.NODE_ENV === 'production')) {
                    setError({ ...error, email: t('errors.email') as string });
                    return false;
                }
                setError({ ...error, email: '' });
                break;
            case CommunicationTypes.Mail:
                if (!state.correspondence?.mailDetails) {
                    setError({ ...error, submit: t('errors.mailDetails') as string });
                    return false;
                }
                setError({ ...error, submit: '' });
                break;
            default:
                if (!state.correspondence.recipient || !formId) {
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
            const requestBody = generateCommunicationRequest(policy, communicationType, state, user, ctiCallNumber, correlationId);
            const response = await sendCommunication(Number(formId), requestBody);
            setLoader(false);
            dispatch({
                type: SendDocumentAction.Confirm,
                payload: {
                    ...state.confirm,
                    ...response,
                },
            });

            goToNext();
        } catch (e: any) {
            setLoader(false);
            setError({ ...error, submit: e?.message as string });
        }
    };

    const handleCancel = () => {
        dispatch({
            type: SendDocumentAction.Reset,
        });
        setCurrentStepIndex(0);
    };

    function renderReceiptComponent(communicationType: string): React.ReactNode {
        switch (communicationType) {
            case CommunicationTypes.Email:
                return <EmailAddress email={email} setEmail={(val: string) => setEmail(val)} error={error} />;
            case CommunicationTypes.Fax:
                return <FaxNumber fax={fax} setFax={(val: string) => setFax(val)} />;
            case CommunicationTypes.Mail:
                return <ContactCenterAddress policy={policy} />;

            default:
                null;
        }
    }

    return (
        <WorkflowCard
            title={t(`tabs.correspondence`)}
            footerContent={<SendDocumentNavigationButtons handleContinue={handleContinue} handleCancel={handleCancel} />}
        >
            <div className="flex flex-col gap-4">
                <Radio
                    items={communicationOptions ?? communicationTypes}
                    label={t('correspondence.label') as string}
                    onChange={event => setCommunicationType(event.target.value as CommunicationTypes)}
                    value={communicationType}
                />
                {loader && <Loader />}
                {renderReceiptComponent(communicationType)}
                {error?.submit && <AssistiveText text={error?.submit} variant={AssistiveTextVariant.Error} className="mt-2" />}
            </div>
        </WorkflowCard>
    );
};

export default Correspondence;
