import MatchCard from '@deps/containers/subpages/funds-sub-page/cards/match-card';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';

import FundDetailsCard from './cards/funds-details-card';
import FundsFirstGlance from './cards/funds-first-glance-card';

interface FundsSubPageProps {
    policy: PolicyDetails;
}

export const FundsSubPage = ({ policy }: FundsSubPageProps) => {
    return (
        <div className="flex grow flex-col rounded bg-white shadow-elevation-light-04">
            <FundsFirstGlance policy={policy} />
            <hr className=" border-1 border-gray-100" />
            {policy.isUniversalLife && <MatchCard policy={policy} />}
            <FundDetailsCard policy={policy} />
        </div>
    );
};

export default FundsSubPage;
