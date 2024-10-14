import AdditionalInformationCard from '@deps/containers/coverage-sub-page/cards/additional-information-card';
import BaseCoverageCard from '@deps/containers/coverage-sub-page/cards/base-coverage-card';
import CoveragePageHeaderContainer from '@deps/containers/page-header/coverage-page-header';
import ContestabilityCard from '@deps/containers/policy-details/cards/contestability/contestability-card';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';
import { Policy } from '@deps/models/policy/sor-policy';

import CoveredPartyCard from '../shared-cards/covered-parties/covered-parties-card';

interface CoverageSubPageProps {
    policy: Policy;
}

export const CoverageSubPage = ({ policy }: CoverageSubPageProps) => {
    const { breadcrumb } = useBreadcrumb();
    const policyDetails = new PolicyDetails(policy);

    return (
        <div className="rounded bg-white shadow-elevation-light-04">
            <CoveragePageHeaderContainer
                breadcrumbText={breadcrumb?.text}
                breadcrumbUrl={breadcrumb?.url}
                policyDetails={policyDetails}
            />
            <BaseCoverageCard policyDetails={policyDetails} />
            <CoveredPartyCard policy={policyDetails} />
            {!policyDetails.isAnnuity && <ContestabilityCard policyDetails={policyDetails} />}
            <AdditionalInformationCard policyDetails={policyDetails} />
        </div>
    );
};

export default CoverageSubPage;
