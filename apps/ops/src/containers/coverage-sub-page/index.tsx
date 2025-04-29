import AdditionalInformationCard from '@deps/containers/coverage-sub-page/cards/additional-information-card';
import BaseCoverageCard from '@deps/containers/coverage-sub-page/cards/base-coverage-card';
import CoveragePageHeaderContainer from '@deps/containers/page-header/coverage-page-header';
import ContestabilityCard from '@deps/containers/policy-details/cards/contestability/contestability-card';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { Policy } from '@deps/models/policy/sor-policy';

import CoveredPartyCard from '../shared-cards/covered-parties/covered-parties-card';

interface CoverageSubPageProps {
    policy: Policy;
}

export const CoverageSubPage = ({ policy }: CoverageSubPageProps) => {
    const policyDetails = new PolicyDetails(policy);

    return (
        <>
            <CoveragePageHeaderContainer policyDetails={policyDetails} />
            <BaseCoverageCard policyDetails={policyDetails} />
            <CoveredPartyCard policy={policyDetails} />
            {!policyDetails.isAnnuity && <ContestabilityCard policyDetails={policyDetails} />}
            <AdditionalInformationCard policyDetails={policyDetails} />
        </>
    );
};

export default CoverageSubPage;
