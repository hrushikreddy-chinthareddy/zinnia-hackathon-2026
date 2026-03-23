import { ClaimCommunicationTypes } from '@deps/containers/death-claim-container/death-claim.types';
import { FormMetadata } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';
import { AddressType } from '@deps/models/policy/sor-policy';

import { TaskHandler } from '../types';

const getDay150ReviewHandler: TaskHandler<
    Record<string, never>,
    Record<string, never>
> = {
    getPayload: () => ({}),

    api: async () => ({}),

    transformResponse: (
        _response: Record<string, never>,
        _metadata: FormMetadata[],
        task: ManagementTask
    ) => {
        if (!task?.data?.details?.benefinalcontactattempt) return;

        const updatedTask = task as ManagementTask;
        if (
            !updatedTask.data.details.benefinalcontactattempt
                .subTaskBeneAddressChangeRequire
        ) {
            updatedTask.data.details.benefinalcontactattempt.subTaskBeneAddressChangeRequire =
                false;
        }

        if (!updatedTask.data.details.benefinalcontactattempt?.beneficiary) {
            updatedTask.data.details.benefinalcontactattempt.beneficiary = {
                notificationPreferences: {
                    address: {
                        addressType: AddressType.RESIDENCE,
                    },
                    notificationMethod: {
                        method: ClaimCommunicationTypes.Mail,
                    },
                },
            };
        }
        const benefinalcontactattempt =
            updatedTask.data.details.benefinalcontactattempt;
        if (!benefinalcontactattempt.beneficiaryChangeDetail) {
            benefinalcontactattempt.beneficiaryChangeDetail = {};
        }
        if (
            !benefinalcontactattempt.beneficiaryChangeDetail
                .notificationPreferences
        ) {
            benefinalcontactattempt.beneficiaryChangeDetail.notificationPreferences =
                benefinalcontactattempt.beneficiary!.notificationPreferences;
        }
        Object.assign(task, updatedTask);
    },
};

export default getDay150ReviewHandler;
