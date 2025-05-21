import { TransactionType } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import StartStep, { StartStepSetState } from '@deps/components/workflows/start-step/start-step';
import { TranslationFiles } from '@deps/config/translations';
import Confirm from '@deps/containers/financial-transactions/fund-transfer/confirm/confirm';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import WorkflowContainer from '@deps/containers/workflow-container/workflow-container';
import { useFundTransfer } from '@deps/contexts/transactions/FundTransferContext';
import { Processes } from '@deps/models/case/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { validateFundTransfer } from '@deps/queries/api/fund-transfer';
import { FUND_TRANSFER_STEP_WIDTH } from '@deps/types/constants';
import { TransactionStep } from '@deps/types/segment-analytics';

import { buildfundTransferRequestBody } from './fund-transfer.helpers';
import Transfer from './transfer/transfer';
import Summary from '../fund-transfer/summary/summary';

export type FundTransferProps = {
    policy: Policy;
};

const FundTransferContainer = ({ policy }: FundTransferProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'fundTransfer' });
    const { fundTransfer, setFundTransfer } = useFundTransfer();

    const startLabel = t('start.label');
    const transferLabel = t('transfer.label');
    const summaryLabel = t('summary.label');
    const confirmLabel = t('confirm.label');

    const validateCall = () =>
        validateFundTransfer(policy.product?.planCode, policy.policyNumber, buildfundTransferRequestBody(fundTransfer));

    const steps: Step[] = [
        {
            component: (
                <StartStep
                    parentPage={ParentPage.Funds}
                    processType={Processes.FundTransfer}
                    policy={policy}
                    setState={setFundTransfer as StartStepSetState}
                    state={fundTransfer}
                    title={t('start.title') as string}
                    subtitle={t('start.subtitle') as string}
                    trackEventProps={{ type: TransactionType.FUND_TRANSFER, step: TransactionStep.Start }}
                />
            ),
            screenReaderLabel: startLabel,
            index: 0,
            text: startLabel,
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
        },
        {
            component: <Summary policy={policy} title={t('summary.title') as string} subtitle={t('summary.subtitle') as string} />,
            screenReaderLabel: summaryLabel,
            index: 2,
            text: summaryLabel,
        },
        {
            component: <Confirm policy={policy} />,
            screenReaderLabel: confirmLabel,
            index: 3,
            text: confirmLabel,
        },
    ];

    return <WorkflowContainer policy={policy} steps={steps} stepWidth={FUND_TRANSFER_STEP_WIDTH} />;
};

export default FundTransferContainer;
