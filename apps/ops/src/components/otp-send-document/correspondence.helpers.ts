import { UserProfile } from '@auth0/nextjs-auth0/client';

import {
    AttachmentDetails,
    CorrespondenceFormParts,
    SendCommunicationRequestBody,
} from '@deps/models/case/correspondence';
import {
    CommunicationTypes,
    SendDocumentFormType,
} from '@deps/models/case/send-document';
import { Policy } from '@zinnia/api-types/types/sor';

export const generateCommunicationRequest = (
    policy: Policy,
    communicationType: CommunicationTypes,
    state: CorrespondenceFormParts,
    user: UserProfile,
    ctiCallNumber: string,
    correlationId: string,
    formType: SendDocumentFormType,
    attachmentDetails: AttachmentDetails[]
): SendCommunicationRequestBody => {
    return {
        formType,
        ctiCallNumber,
        correlationId,
        createdBy: user.email || '',
        policyDetails: {
            contractNumber: policy.policyNumber || '',
            planCode: policy.product?.planCode || '',
            carrier: policy?.carrierId || '',
            productName: policy.product?.lineOfBusiness || '',
            qualType: policy.qualificationType || '',
            status: policy?.policyStatus || '',
            issueState: policy?.issueState || '',
            issueDate: policy?.policyDates?.issueDate || '',
        },
        attachmentDetails,
        receiverDetails: {
            deliveryType: communicationType,
            recipientList: state.correspondence?.recipients ?? [],
            ccList: state.correspondence?.ccList ?? [],
            mailDetails:
                communicationType === CommunicationTypes.Mail
                    ? state.correspondence?.mailDetails
                    : undefined,
        },
    };
};
