import { ClaimCommunicationTypes } from '@deps/containers/death-claim-container/death-claim.types';
import { FormMetadata } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';
import { AddressType } from '@deps/models/policy/sor-policy';

import { TaskHandler } from '../types';

const getBeneAddressVerificationHandler: TaskHandler<
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
        if (!task?.data?.details?.beneAddress) return;

        const updatedTask = task as ManagementTask;
        if (!updatedTask.data.details.beneAddress?.beneficiary) {
            updatedTask.data.details.beneAddress.beneficiary = {
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
        const beneAddress = updatedTask.data.details.beneAddress;
        if (!beneAddress.beneficiaryChangeDetail) {
            beneAddress.beneficiaryChangeDetail = {};
        }
        if (!beneAddress.beneficiaryChangeDetail.notificationPreferences) {
            beneAddress.beneficiaryChangeDetail.notificationPreferences =
                beneAddress.beneficiary!.notificationPreferences;
        }
        Object.assign(task, updatedTask);
    },
};

export default getBeneAddressVerificationHandler;
