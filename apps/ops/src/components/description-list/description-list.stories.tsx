import { Meta } from '@storybook/react';
import { useTranslation } from 'next-i18next';

import {
    PolicySummaryColDto,
    getPolicySummaryColDefs,
    toPolicySummaryColDto,
} from '@deps/data/policy-summary';
import { fillColDefs } from '@deps/helpers/data-transform.helpers';
import { Policy } from '@zinnia/api-types/types/sor';

import DescriptionList from './description-list';
import DescriptionLists from './description-lists';

export default {
    title: 'Components/DescriptionList',
    component: DescriptionList,
    decorators: [
        (Story) => (
            <div>
                <Story />
            </div>
        ),
    ],
} as Meta<typeof DescriptionList>;

export const DescriptionListDefault = () => (
    <>
        <DescriptionList label="Label" text="Field Value" />
    </>
);

export const DescriptionListWithTooltip = () => (
    <>
        <DescriptionList
            label="Label"
            text="Field Value"
            tooltip="Here is a tooltip"
        />
    </>
);

export const DescriptionListsWithTooltips = () => {
    const { t } = useTranslation();

    const policySummaryDto = toPolicySummaryColDto({} as Policy);
    const policySummaryColDefs = fillColDefs<PolicySummaryColDto>(
        policySummaryDto,
        getPolicySummaryColDefs(t)
    );

    return (
        <>
            <DescriptionLists data={policySummaryColDefs} />
        </>
    );
};
