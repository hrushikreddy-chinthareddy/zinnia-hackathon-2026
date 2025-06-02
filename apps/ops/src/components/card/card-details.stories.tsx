import { Meta } from '@storybook/react';
import { Status } from '@zinnia/api-types/types/sor';

import { ReactComponent as EverlyLogo } from '@deps/styles/elements/logos/everly-logo.svg';
import { CardInfoVariant } from '@deps/types/components';
import { mockPolicyData } from '@deps/utils/mockData';

import CardBarPolicyHolder from './card-bar-policy-holder/card-bar-policy-holder';
import DetailsCard from './card-details';
import { BadgeVariant } from '../badge/badge.helpers';

export default {
    title: 'Components/CardDetails',
    component: DetailsCard,
    decorators: [
        Story => (
            <div>
                <Story />
            </div>
        ),
    ],
} as Meta<typeof DetailsCard>;

const [info, summary] = mockPolicyData();
const header = (
    <>
        <CardBarPolicyHolder label="Policy Number" value={'11000781'} status={Status.ACTIVE} variant={BadgeVariant.Positive} />
        <div>
            <EverlyLogo height={'32px'} width={'96px'} />
        </div>
    </>
);

export const PolicyCardDetails = () => (
    <DetailsCard variant={CardInfoVariant.DEFAULT} titles={['Owner Info', 'Policy Summary']} items={[info, summary]} header={header} />
);
