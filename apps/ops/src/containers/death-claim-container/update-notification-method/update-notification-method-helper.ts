import { v4 as uuid4 } from 'uuid';

import {
    AddressNotificationMethod,
    EmailNotificationMethod,
    FaxNotificationMethod,
    NotificationsTransactionData,
} from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab/bene-notification-tab.types';
import { ChangeTypeEnum } from '@deps/containers/task-container/components/steps/claims/claims.type';
import { TaskActions } from '@deps/contexts/UpdateNotificationMethodContext';
import { CaseIdentifierType } from '@deps/models/case/task';
import { Policy } from '@zinnia/api-types/types/sor';

import {
    ClaimActionTypes,
    ClaimCommunicationTypes,
} from '../death-claim.types';

export const lowerCaseJson = (obj: unknown) => {
    return JSON.stringify(obj, (_key: string, value: unknown) => {
        if (typeof value === 'string') {
            return value.trim().toLowerCase();
        }
        return value;
    });
};

export const buildUpdateNotificationMethodPayload = (
    policy: Policy,
    transactionData: NotificationsTransactionData,
    emailData: EmailNotificationMethod,
    faxData: FaxNotificationMethod,
    addressData: AddressNotificationMethod,
    updatedNotificationMethod: ClaimCommunicationTypes | string,
    taskActions: TaskActions[]
) => {
    const { correlationId, recordId, identifiers, entity } = transactionData;
    const { policyNumber, carrierId } = policy;
    const zlCaseId = identifiers?.find(
        (item) => item.identifier === CaseIdentifierType.ZL_CASE_ID
    )?.value;

    const notificationPrefs = transactionData?.entity?.notificationPreferences;
    const originalEmail = (notificationPrefs?.email?.emailAddress || '').trim();
    const originalFax = (notificationPrefs?.fax?.faxNumber || '').trim();
    const originalAddress = notificationPrefs?.address || {};
    const newEmail = (emailData?.emailAddress ?? '').trim();
    const newFax = (faxData?.faxNumber ?? '').trim();

    const faxAction =
        updatedNotificationMethod === ClaimCommunicationTypes.Fax &&
        originalFax !== newFax
            ? ClaimActionTypes.UPDATE
            : ClaimActionTypes.NONE;
    const emailAction =
        updatedNotificationMethod === ClaimCommunicationTypes.Email &&
        originalEmail.toLowerCase() !== newEmail.toLowerCase()
            ? ClaimActionTypes.UPDATE
            : ClaimActionTypes.NONE;
    const addressAction =
        updatedNotificationMethod === ClaimCommunicationTypes.Mail &&
        lowerCaseJson(originalAddress) !== lowerCaseJson(addressData)
            ? ClaimActionTypes.UPDATE
            : ClaimActionTypes.NONE;
    const addrValue =
        addressAction === ClaimActionTypes.UPDATE
            ? addressData
            : originalAddress;

    const isUpdatedNotificationMethod = taskActions.includes(
        TaskActions.UPDATE_NOTIFICATION_METHOD
    );

    let beneficiaryChangeDetail = {};
    if (isUpdatedNotificationMethod) {
        beneficiaryChangeDetail = {
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
                            ? newFax
                            : originalFax,
                },
                email: {
                    action: emailAction,
                    emailAddress:
                        emailAction === ClaimActionTypes.UPDATE
                            ? newEmail
                            : originalEmail,
                },
                address: {
                    action: addressAction,
                    ...addrValue,
                },
            },
        };
    }
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
        taskActions,
        beneficiaryChangeDetail,
    };

    return payload;
};
