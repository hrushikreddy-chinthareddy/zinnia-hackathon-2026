import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import { PolicyData } from '@deps/contexts/PolicyDataContext';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';

import PolicyTimelineCard from './cards/policy-timeline-card';
import ProductDetailsCard from './cards/product-details-card';
import SalesChannelCard from './cards/sales-channel-card';
import { mapPolicyDetails } from './policy-details.helper';
import PolicyDetailsHeaderCard from '../page-header/policy-details-header';
import InsuredCard from '../shared-cards/insured/insured-card';

export const PolicyDetailsContainer = () => {
    const { policy } = useContext(PolicyData);
    const { t } = useTranslation();

    const { insured, meta, policyDetails, policyTimeline, productDetails, salesChannel } = mapPolicyDetails(policy, t);
    const { breadcrumb } = useBreadcrumb();

    return (
        <div className="rounded bg-white text-gray-900 shadow-elevation-light-04">
            <PolicyDetailsHeaderCard
                meta={meta}
                policyDetailsHeaderData={policyDetails}
                breadcrumbText={breadcrumb?.text}
                breadcrumbUrl={breadcrumb?.url}
            />
            <hr className="border-b-2 border-gray-100" />
            <InsuredCard insuredCardData={insured} />
            <PolicyTimelineCard policyTimelineCardData={policyTimeline} productType={productDetails.productType} />
            <SalesChannelCard salesChannelCardData={salesChannel} />
            <ProductDetailsCard productDetailsCardData={productDetails} />
        </div>
    );
};

export default PolicyDetailsContainer;
