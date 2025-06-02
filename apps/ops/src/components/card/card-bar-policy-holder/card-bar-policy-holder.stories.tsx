import { Meta } from '@storybook/react';
import { Status } from '@zinnia/api-types/types/sor';

import { BadgeVariant } from '@deps/components/badge/badge.helpers';

import CardBarPolicyHolder from './card-bar-policy-holder';

export default {
    title: 'Containers/CardBarPolicyHolder',
    container: CardBarPolicyHolder,
    decorators: [
        Story => (
            <div>
                <Story />
            </div>
        ),
    ],
} as Meta<typeof CardBarPolicyHolder>;

export const CardBarPolicyHolderDefault = () => (
    <>
        <CardBarPolicyHolder label="Policy Number" value="11000781" />
    </>
);

export const CardBarPolicyHolderWithState = () => (
    <>
        <CardBarPolicyHolder label="Policy Number" value="11000781" status={Status.ACTIVE} variant={BadgeVariant.Positive} />
    </>
);
