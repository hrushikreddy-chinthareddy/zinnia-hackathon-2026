import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';

import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import ConfirmCard from '@deps/components/transactions/financial/confirm-card';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { buildWithdrawalsRequestBody } from '@deps/containers/financial-transactions/withdrawal/withdrawals.helpers';
import { WithdrawalType, useWithdrawal } from '@deps/contexts/transactions/WithdrawalContext';
import { Statuses } from '@deps/models/case/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { TransactionResponseStatus, submitFullSurrenderWithdrawal, submitPartialWithdrawalOneTime } from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';

interface ConfirmProps {
    policy: Policy;
}

const Confirm = ({ policy }: ConfirmProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'withdrawals.confirm' });
    const { t: defaultT } = useTranslation();

    const { withdrawal } = useWithdrawal();
    const [submitFailed, setSubmitFailed] = useState(false);
    const [submitNigo, setSubmitNigo] = useState(false);
    const [newCaseId, setNewCaseId] = useState<string | undefined>(withdrawal.caseId);

    const [isLoading, setIsLoading] = useState(true);

    const validationSucceeded = useMemo(
        () => withdrawal.validationResponse?.status === TransactionResponseStatus.Success,
        [withdrawal.validationResponse]
    );

    const submit = useCallback(async () => {
        const requestBody = buildWithdrawalsRequestBody(withdrawal);
        const response =
            withdrawal.type === WithdrawalType.Surrender
                ? await submitFullSurrenderWithdrawal(policy.product?.planCode, policy.policyNumber, requestBody)
                : await submitPartialWithdrawalOneTime(policy.product?.planCode, policy.policyNumber, requestBody);

        if (response.status !== StatusCode.Accepted) {
            setSubmitFailed(true);
        } else {
            if (response?.data?.caseStatus === Statuses.Exception) {
                setSubmitNigo(true);
            }
            setNewCaseId(response?.data?.caseId);
        }

        setIsLoading(false);
    }, [policy.policyNumber, policy.product?.planCode, withdrawal]);

    useEffect(() => {
        submit();
    }, [submit]);

    if (isLoading) {
        return (
            <div className="responsive-padding flex h-[300px] w-full grow">
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );
    }

    if (submitFailed) {
        return (
            <ApiErrorCard
                leaveRoute={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/withdrawals`}
                submit={{
                    action: submit,
                    text: defaultT('workflows.apiErrorCard.submitWithdrawal'),
                }}
            />
        );
    }

    return (
        <div className="responsive-padding flex h-full w-full grow flex-col items-center justify-center">
            <ConfirmCard
                caseId={newCaseId}
                isNigo={!validationSucceeded || submitNigo}
                parentPage={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/withdrawals`}
                amount={withdrawal.amount}
                payorPayeeName={withdrawal.payeeFullName}
                type={t('type')}
            />
        </div>
    );
};

export default Confirm;
