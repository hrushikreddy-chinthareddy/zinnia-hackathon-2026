import { FormMetadata } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';

import { TaskHandler } from '../types';

const giactCallOutHandler: TaskHandler<any, any> = {
    getPayload: () => ({}),

    api: async () => ({}),

    transformResponse: (
        __response: any,
        metadata: FormMetadata[],
        task?: ManagementTask
    ) => {
        if (!task?.data?.details?.communicationDetails?.preferredInd) {
            return;
        }

        const { preferredInd } = task.data.details.communicationDetails;

        const uiSchema = metadata[0]?.uiSchema;

        if (!uiSchema?.details?.communicationDetails) {
            return;
        }

        const phoneFields = [
            'mobilePhoneNumber',
            'homePhoneNumber',
            'businessPhoneNumber',
        ];
        phoneFields.forEach((field) => {
            if (uiSchema.details.communicationDetails[field]?.['ui:options']) {
                delete uiSchema.details.communicationDetails[field][
                    'ui:options'
                ].assistiveText;
                delete uiSchema.details.communicationDetails[field][
                    'ui:options'
                ].assistiveColor;
            }
        });

        const preferredFieldMap: Record<string, string> = {
            MOBILE: 'mobilePhoneNumber',
            HOME: 'homePhoneNumber',
            BUSINESS: 'businessPhoneNumber',
        };

        const fieldToUpdate = preferredFieldMap[preferredInd?.toUpperCase()];

        if (
            fieldToUpdate &&
            uiSchema.details.communicationDetails[fieldToUpdate]?.['ui:options']
        ) {
            uiSchema.details.communicationDetails[fieldToUpdate][
                'ui:options'
            ].assistiveText = 'Preferred';
            uiSchema.details.communicationDetails[fieldToUpdate][
                'ui:options'
            ].assistiveColor = 'info';
        }
    },
};

export default giactCallOutHandler;
