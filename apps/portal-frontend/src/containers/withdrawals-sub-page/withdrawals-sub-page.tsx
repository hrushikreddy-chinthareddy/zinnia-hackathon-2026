import { useEffect, useState } from 'react';

import WithdrawalsPageHeaderContainer from '@deps/containers/page-header/withdrawals-page-header';
import WithdrawalRules from '@deps/containers/withdrawal-rules/withdrawal-rules';
import { formatValidationResult } from '@deps/helpers/bpm-transaction.helper';
import { mapWithdrawalsSubPage } from '@deps/helpers/withdrawals.helper';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';
import { Policy } from '@deps/models/policy/sor-policy';
import { TransactionResponseStatus, checkEligibilityPartialWithdrawalOneTime } from '@deps/queries/api/bpm';

interface WithdrawalsSubPageProps {
    policy: Policy;
}

export interface WithdrawalEligibilityValues {
    ineligibleReason: string;
    isEligible: boolean;
    isLoading: boolean;
}

const WithdrawalsSubPage = ({ policy }: WithdrawalsSubPageProps) => {
    const { breadcrumb } = useBreadcrumb();

    const [withdrawalEligibilityValues, setWithdrawalEligibilityValues] = useState({
        ineligibleReason: '',
        isEligible: false,
        isLoading: true,
    });

    const { policyNumber, product } = policy;
    const { planCode } = product ?? {};

    useEffect(() => {
        const checkWithdrawalEligibility = async () => {
            const manageAutopayEligibility = await checkEligibilityPartialWithdrawalOneTime(planCode, policyNumber);

            if (manageAutopayEligibility?.status === TransactionResponseStatus.Success) {
                setWithdrawalEligibilityValues(prevState => ({ ...prevState, isEligible: true, isLoading: false }));
            } else {
                setWithdrawalEligibilityValues(prevState => ({
                    ...prevState,
                    ineligibleReason: formatValidationResult(manageAutopayEligibility?.validationResult),
                    isLoading: false,
                }));
            }
        };

        checkWithdrawalEligibility();
    }, [planCode, policyNumber]);

    const withdrawalsValues = mapWithdrawalsSubPage({ isEligible: withdrawalEligibilityValues.isEligible, policy });

    return (
        <div className="rounded bg-gray-50 shadow-elevation-light-04">
            <WithdrawalsPageHeaderContainer
                breadcrumbText={breadcrumb?.text}
                breadcrumbUrl={breadcrumb?.url}
                withdrawalEligibilityValues={withdrawalEligibilityValues}
                planCode={policy.product?.planCode}
                policyNumber={policy.policyNumber}
                withdrawalsValues={withdrawalsValues}
            />
            <hr className="h-0.5 border-none bg-gray-100" />
            <WithdrawalRules policy={policy} />
        </div>
    );
};

export default WithdrawalsSubPage;
