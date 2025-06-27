import { FeatureType } from '@zinnia/api-types/types/sor';

import FixedCostPeriod from '@deps/containers/policy-details/cards/display-fields/fixed-cost-period';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';

import AccountValue from '../display-fields/account-value';
import BaseDeathBenefit from '../display-fields/base-death-benefit';
import FreeLookCancelDate from '../display-fields/free-look-cancel-date';
import IssueDate from '../display-fields/issue-date';
import MaturityDate from '../display-fields/maturity-date';
import SurrenderValue from '../display-fields/surrender-value';
import UpcomingPremiumDisplayField from '../display-fields/upcoming-premium';

const EverlyIul = ({ policy }: BasePolicyComponentArgs) => {
    const freeLookFeature = policy.features.getFirstFeatureByType(
        FeatureType.FREELOOK
    );

    return (
        <>
            <UpcomingPremiumDisplayField policy={policy} />
            <FixedCostPeriod
                fixedCostPeriod={policy.fixedCostPeriod}
                fixedCostPeriodLeft={policy.fixedCostPeriodLeft}
            />
            <BaseDeathBenefit baseDeathBenefit={policy.baseDeathBenefit} />
            <IssueDate issueDate={policy.issueDate} />
            <AccountValue accountValue={policy.accountValue} />
            <MaturityDate maturityDate={policy.maturityDate} />
            <SurrenderValue surrenderValue={policy.surrenderValue} />
            <FreeLookCancelDate freeLookCancelDate={freeLookFeature?.endDate} />
        </>
    );
};

export default EverlyIul;
