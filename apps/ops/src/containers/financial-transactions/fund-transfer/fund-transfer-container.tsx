import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';

import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import StartStep, {
    StartStepSetState,
} from '@deps/components/workflows/start-step/start-step';
import { TranslationFiles } from '@deps/config/translations';
import Confirm from '@deps/containers/financial-transactions/fund-transfer/confirm/confirm';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import WorkflowContainer from '@deps/containers/workflow-container/workflow-container';
import { useFundTransfer } from '@deps/contexts/transactions/FundTransferContext';
import { useCasesQuery } from '@deps/hooks/useCasesQuery';
import { Processes } from '@deps/models/case/case';
import { validateFundTransfer } from '@deps/queries/api/fund-transfer';
import { FUND_TRANSFER_STEP_WIDTH } from '@deps/types/constants';
import { TransactionStep } from '@deps/types/segment-analytics';
import { Policy, TransactionTypeEnum } from '@zinnia/api-types/types/sor';

import { buildfundTransferRequestBody } from './fund-transfer.helpers';
import Transfer from './transfer/transfer';
import Summary from '../fund-transfer/summary/summary';

export type FundTransferProps = {
    policy: Policy;
};

const FundTransferContainer = ({ policy }: FundTransferProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'fundTransfer',
    });
    const { fundTransfer, setFundTransfer } = useFundTransfer();

    const startLabel = t('start.label');
    const transferLabel = t('transfer.label');
    const summaryLabel = t('summary.label');
    const confirmLabel = t('confirm.label');

    const { data: casesResponse, isLoading } = useCasesQuery({
        policyNumber: policy.policyNumber,
        process: [Processes.FundManagement],
        requestSubType: [Processes.FundTransfer],
        enabled: !!policy.policyNumber,
    });
    const hasCases =
        Array.isArray(casesResponse?.data) && casesResponse.data.length > 0;

    const validateCall = useCallback(
        () =>
            validateFundTransfer(
                policy.product?.planCode,
                policy.policyNumber,
                buildfundTransferRequestBody(fundTransfer)
            ),
        [policy.product?.planCode, policy.policyNumber, fundTransfer]
    );

    const steps: Step[] = useMemo(
        () => [
            {
                component: (
                    <StartStep
                        parentPage={ParentPage.Funds}
                        processType={Processes.FundManagement}
                        processSubType={[Processes.FundTransfer]}
                        policy={policy}
                        setState={setFundTransfer as StartStepSetState}
                        state={fundTransfer}
                        title={t('start.title') as string}
                        subtitle={t('start.subtitle') as string}
                        trackEventProps={{
                            type: TransactionTypeEnum.FUND_TRANSFER,
                            step: TransactionStep.Start,
                        }}
                    />
                ),
                screenReaderLabel: startLabel,
                index: 0,
                text: startLabel,
                isVisible: () => hasCases,
            },
            {
                component: (
                    <Transfer
                        policy={policy}
                        validateTransaction={validateCall}
                        title={t('transfer.title') as string}
                        subtitle={t('transfer.subtitle') as string}
                    />
                ),
                screenReaderLabel: transferLabel,
                index: 1,
                text: transferLabel,
                isVisible: () => true,
            },
            {
                component: (
                    <Summary
                        policy={policy}
                        title={t('summary.title') as string}
                        subtitle={t('summary.subtitle') as string}
                    />
                ),
                screenReaderLabel: summaryLabel,
                index: 2,
                text: summaryLabel,
                isVisible: () => true,
            },
            {
                component: <Confirm policy={policy} />,
                screenReaderLabel: confirmLabel,
                index: 3,
                text: confirmLabel,
                isVisible: () => true,
            },
        ],
        [
            policy,
            setFundTransfer,
            fundTransfer,
            hasCases,
            validateCall,
            startLabel,
            transferLabel,
            summaryLabel,
            confirmLabel,
            t,
        ]
    );

    const filteredSteps: Step[] = useMemo(
        () =>
            steps
                .filter((item) => item.isVisible?.())
                .map((item, index) => ({ ...item, index })),
        [steps]
    );

    return isLoading ? (
        <PageLoader variant={PageLoaderVariant.Center} />
    ) : (
        <WorkflowContainer
            policy={policy}
            steps={filteredSteps}
            stepWidth={FUND_TRANSFER_STEP_WIDTH}
        />
    );
};

export default FundTransferContainer;
