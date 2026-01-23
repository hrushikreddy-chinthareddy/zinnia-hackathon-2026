import MatchCard from '@deps/containers/subpages/funds-sub-page/cards/match-card';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';

import FundDetailsCard from './cards/funds-details-card';
import FundsFirstGlance from './cards/funds-first-glance-card';
import PremiumBonusCard from './cards/premium-bonus-card/premium-bonus-card';

interface FundsSubPageProps {
    policy: PolicyDetails;
}

export const FundsSubPage = ({ policy }: FundsSubPageProps) => {
    const hasPopulatedMatchSegment = Object.values(
        policy?.policy?.allocation?.matchSegment || {}
    ).some((val) => !isNullEmptyOrUndefined(val));
    return (
        <div className="flex grow flex-col">
            <FundsFirstGlance policy={policy} />
            <hr className=" border-1 border-gray-200" />
            {policy.isUniversalLife && <MatchCard policy={policy} />}
            {policy.isAnnuity && hasPopulatedMatchSegment && (
                <PremiumBonusCard policy={policy} />
            )}
            <FundDetailsCard policy={policy} />
        </div>
    );
};
export default FundsSubPage;
