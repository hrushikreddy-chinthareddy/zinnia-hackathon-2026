import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';

import AccountValue from '../display-fields/account-value';
import BaseDeathBenefit from '../display-fields/base-death-benefit';
import IssueDate from '../display-fields/issue-date';
import MaturityDate from '../display-fields/maturity-date';
import SurrenderValue from '../display-fields/surrender-value';
import UpcomingPremiumDisplayField from '../display-fields/upcoming-premium';

const EverlyUl = ({ policy }: BasePolicyComponentArgs) => {
    return (
        <>
            <UpcomingPremiumDisplayField policy={policy} />
            <BaseDeathBenefit baseDeathBenefit={policy.baseDeathBenefit} />
            <IssueDate issueDate={policy.issueDate} />
            <AccountValue accountValue={policy.accountValue} />
            <MaturityDate maturityDate={policy.maturityDate} />
            <SurrenderValue surrenderValue={policy.surrenderValue} />
        </>
    );
};

export default EverlyUl;
