import { useMemo } from 'react';

import MatchCard from '@deps/containers/subpages/funds-sub-page/cards/match-card';
import { getFirstGlanceViewModel, isUniversalLife } from '@deps/containers/subpages/funds-sub-page/funds.helper';
import { Policy } from '@deps/models/policy/sor-policy';

import FundDetailsCard from './cards/funds-details-card';
import FundsFirstGlance from './cards/funds-first-glance-card';

// TODO MG: shared prop type that has policy
interface FundsSubPageProps {
    policy: Policy;
}

// TODO MG: rename to FundsPage and move under policy-details
export const FundsSubPage = ({ policy }: FundsSubPageProps) => {
    const firstGlanceViewModel = useMemo(() => {
        return getFirstGlanceViewModel(policy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex grow flex-col rounded bg-white shadow-elevation-light-04">
            <FundsFirstGlance {...firstGlanceViewModel } />
            <hr className=" border-1 border-gray-100" />
            {isUniversalLife(policy.product?.productType) && (
                <MatchCard policy={policy} />
            )}
            <FundDetailsCard policy={policy} />
        </div>
    );
};

export default FundsSubPage;
