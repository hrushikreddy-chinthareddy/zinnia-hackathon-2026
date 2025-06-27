import { Policy } from '@zinnia/api-types/types/sor';

import {
    AddressNotificationMethod,
    EmailNotificationMethod,
    FaxNotificationMethod,
    NotificationsTransactionData,
} from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab.types';

import {
    ClaimActionTypes,
    ClaimCommunicationTypes,
} from '../death-claim.types';

export const buildUpdateNotificationMethodPayload = (
    policy: Policy,
    transactionData: NotificationsTransactionData,
    emailData: EmailNotificationMethod,
    faxData: FaxNotificationMethod,
    addressData: AddressNotificationMethod,
    updatedNotificationMethod: ClaimCommunicationTypes | string
) => {
    const { correlationId, recordId, identifiers, entity } = transactionData;
    const { policyNumber, carrierId } = policy;
    const zlCaseId = identifiers?.find(
        (item) => item.identifier === 'zlCaseId'
    )?.value;
    const payload = {
        correlationId,
        zlCaseId,
        sorSystem: 'LifeCad',
        sourceSystem: 'ZLCM',
        carrierId,
        planCode: policy.product?.planCode,
        policyNumber,
        updateDate: new Date().toISOString().split('T')[0],
        beneficiaryRecordId: recordId,
        beneficiaryChangeDetail: {
            changeRequire: true,
            changeType: 'BENEFICIARY_NOTIFICATION_CHANGE',
            notificationPreferences: {
                notificationMethod: {
                    method: updatedNotificationMethod,
                    action:
                        entity?.notificationPreferences?.notificationMethod
                            ?.method !== updatedNotificationMethod
                            ? ClaimActionTypes.UPDATE
                            : ClaimActionTypes.NONE,
                },
                fax: {
                    action: faxData.action || ClaimActionTypes.NONE,
                    faxNumber: faxData?.faxNumber,
                },
                email: {
                    action: emailData.action || ClaimActionTypes.NONE,
                    emailAddress: emailData?.emailAddress,
                },
                address: {
                    ...addressData,
                    action: addressData?.action || ClaimActionTypes.NONE,
                },
            },
        },
    };
    return payload;
};
