import { NigoExceptionResponse } from '@deps/containers/nigo-entry-container/components/steps/nigo-details/nigo-details.types';
import { NigoSearch } from '@deps/queries/api/nigo-search';

import { TaskHandler, ReviewPayload } from '../types';

const thirdPartyDetailHandler: TaskHandler<
    ReviewPayload,
    NigoExceptionResponse[]
> = {
    api: NigoSearch,

    getPayload: (task: any) => ({
        category: ['Existing Name Change'],
        businessProcess: task?.process,
        carrier: task?.carrier,
    }),

    transformResponse: (response, metadata, task) => {
        if (!response || response.length === 0) return;

        const reasonList = Array.from(new Set(response.map((item) => item)));

        const seen = new Set<string>();
        const declineReasonEnum: string[] = [];
        const declineReasonOptions: {
            label: string;
            value: string;
            category: string;
            reason: string;
            detailedReason: string;
            selectOptions: any;
        }[] = [];

        for (const r of reasonList) {
            if (!seen.has(r.detailedReason)) {
                seen.add(r.detailedReason);

                const selectOptions = r.exceptionSubRefs
                    .filter(
                        (item) =>
                            item.carrier === task?.carrier &&
                            item.process === task?.process
                    )
                    .map((item) => ({
                        label: item.subNmIdDetail,
                        value: item.subNmId,
                    }));

                if (selectOptions.length) {
                    declineReasonEnum.push(r.detailedReason);
                    declineReasonOptions.push({
                        label: r.detailedReason,
                        value: r.nmId,
                        category: r.category,
                        reason: r.reason,
                        detailedReason: r.detailedReason,
                        selectOptions,
                    });
                }
            }
        }

        metadata[0].uiSchema.declineReason = {
            'ui:options': {
                label: true,
                widget: 'CheckBoxesSelectWidget',
                enumOptions: declineReasonOptions,
            },
            'ui:dataPath': ['declineReason'],
        };
    },
};

export default thirdPartyDetailHandler;
