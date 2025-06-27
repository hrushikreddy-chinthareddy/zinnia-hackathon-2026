import { useContext } from 'react';

import PolicyDetailsHeaderCard from '@deps/containers/page-header/policy-details-header';
import { AnnuityApplicationDetailsCard } from '@deps/containers/policy-details/cards/application-details/annuity-application-details-card.tsx';
import { PolicyApplicationDetailsCard } from '@deps/containers/policy-details/cards/application-details/policy-application-details-card';
import ProductDetailsCard from '@deps/containers/policy-details/cards/product-details-card';
import {
    AnnuityTimelineCard,
    LifeTimelineCard,
} from '@deps/containers/policy-details/cards/timeline-card';
import {
    AnnuitantCard,
    InsuredCard,
} from '@deps/containers/shared-cards/covered-parties/covered-parties-card';
import { PolicyData } from '@deps/contexts/PolicyDataContext';

const AnnuityPolicyDetailsContainer = () => {
    const { policyDetails } = useContext(PolicyData);

    return (
        <>
            <PolicyDetailsHeaderCard policy={policyDetails} />
            <hr className="border-t-2 border-gray-200" />
            <AnnuitantCard policy={policyDetails} />
            <AnnuityTimelineCard policy={policyDetails} />
            <AnnuityApplicationDetailsCard policy={policyDetails} />
            <ProductDetailsCard policy={policyDetails} />
        </>
    );
};

const LifePolicyDetailsContainer = () => {
    const { policyDetails } = useContext(PolicyData);

    return (
        <>
            <PolicyDetailsHeaderCard policy={policyDetails} />
            <hr className="border-t-2 border-gray-200" />
            <InsuredCard policy={policyDetails} />
            <LifeTimelineCard policy={policyDetails} />
            <PolicyApplicationDetailsCard policy={policyDetails} />
            <ProductDetailsCard policy={policyDetails} />
        </>
    );
};

const PolicyDetailsSubPage = () => {
    const { policyDetails } = useContext(PolicyData);
    if (policyDetails.isAnnuity) {
        return <AnnuityPolicyDetailsContainer />;
    }

    if (policyDetails.isLife) {
        return <LifePolicyDetailsContainer />;
    }

    return <LifePolicyDetailsContainer />;
};

export default PolicyDetailsSubPage;
