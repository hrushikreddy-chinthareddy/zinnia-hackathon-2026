import { Policy } from '@zinnia/api-types/types/sor';
import { v4 as uuid4 } from 'uuid';

import {
    AddressNotificationMethod,
    EmailNotificationMethod,
    FaxNotificationMethod,
    NotificationsTransactionData,
} from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab/bene-notification-tab.types';
import { ChangeTypeEnum } from '@deps/containers/task-container/components/steps/claims/claims.type';

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
    updatedNotificationMethod: ClaimCommunicationTypes | string,
    contactEstablished: boolean | null
) => {
    const { correlationId, recordId, identifiers, entity } = transactionData;
    const { policyNumber, carrierId } = policy;
    const zlCaseId = identifiers?.find(
        (item) => item.identifier === 'zlCaseId'
    )?.value;

    const notificationPrefs = transactionData?.entity?.notificationPreferences;
    const originalEmail = notificationPrefs?.email?.emailAddress || '';
    const originalFax = notificationPrefs?.fax?.faxNumber || '';
    const originalAddress = notificationPrefs?.address || {};

    const faxAction =
        updatedNotificationMethod === ClaimCommunicationTypes.Fax &&
        originalFax !== faxData?.faxNumber
            ? ClaimActionTypes.UPDATE
            : ClaimActionTypes.NONE;
    const emailAction =
        updatedNotificationMethod === ClaimCommunicationTypes.Email &&
        originalEmail !== emailData?.emailAddress
            ? ClaimActionTypes.UPDATE
            : ClaimActionTypes.NONE;
    const addressAction =
        updatedNotificationMethod === ClaimCommunicationTypes.Mail &&
        JSON.stringify(originalAddress) !== JSON.stringify(addressData)
            ? ClaimActionTypes.UPDATE
            : ClaimActionTypes.NONE;
    const addrValue =
        addressAction === ClaimActionTypes.UPDATE
            ? addressData
            : originalAddress;

    const beneficiaryChangeDetail = {
        changeRequire: true,
        changeType: ChangeTypeEnum.BENEFICIARY_NOTIFICATION_CHANGE,
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
                action: faxAction,
                faxNumber:
                    faxAction === ClaimActionTypes.UPDATE
                        ? faxData?.faxNumber
                        : originalFax,
            },
            email: {
                action: emailAction,
                emailAddress:
                    emailAction === ClaimActionTypes.UPDATE
                        ? emailData?.emailAddress
                        : originalEmail,
            },
            address: {
                action: addressAction,
                ...addrValue,
            },
        },
    };
    const payload = {
        correlationId: correlationId ?? uuid4(),
        zlCaseId,
        sorSystem: 'LifeCad',
        sourceSystem: 'ZLCM',
        carrierId,
        planCode: policy.product?.planCode,
        policyNumber,
        updateDate: new Date().toISOString().split('T')[0],
        beneficiaryRecordId: recordId,
        contactEstablished,
        beneficiaryChangeDetail: contactEstablished
            ? {}
            : beneficiaryChangeDetail,
    };

    return payload;
};
