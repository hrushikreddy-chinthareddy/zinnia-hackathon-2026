import { useContext } from 'react';

import PolicyDetailsHeaderCard from '@deps/containers/page-header/policy-details-header';
import CoveredPartiesCard from '@deps/containers/shared-cards/covered-parties/covered-parties-card';
import { PolicyData } from '@deps/contexts/PolicyDataContext';

import ProductDetailsCard from './cards/product-details-card';
import SalesChannelCard from './cards/sales-channel-card';
import TimelineCard from './cards/timeline-card';

export const PolicyDetailsContainer = () => {
    const { policyDetails } = useContext(PolicyData);

    return (
        <div className="rounded bg-white text-gray-900 shadow-elevation-light-04">
            <PolicyDetailsHeaderCard policy={policyDetails} />
            <hr className="border-b-2 border-gray-100" />
            <CoveredPartiesCard policy={policyDetails} />
            <TimelineCard policy={policyDetails} />
            <SalesChannelCard policy={policyDetails} />
            <ProductDetailsCard policy={policyDetails} />
        </div>
    );
};

export default PolicyDetailsContainer;
