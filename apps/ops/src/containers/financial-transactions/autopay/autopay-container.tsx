import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useCallback } from 'react';

import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import PayeesStep, {
    PayeesStepSetState,
} from '@deps/components/workflows/payees-step/payees-step';
import PaymentStep from '@deps/components/workflows/payment-step/payment-step';
import PaymentStepMoneyOut from '@deps/components/workflows/payment-step/payment-step-money-out';
import { PaymentStepSetState } from '@deps/components/workflows/payment-step/types';
import PayorStep, {
    PayorStepSetState,
} from '@deps/components/workflows/payor-step/payor-step';
import StartStep, {
    StartStepSetState,
} from '@deps/components/workflows/start-step/start-step';
import { CarrierCode, FarmersPlanCodes } from '@deps/constants/policy';
import { checkCustomPolicy } from '@deps/containers/policy-details/policy-details.helpers';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import WorkflowContainer from '@deps/containers/workflow-container/workflow-container';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useAutopay } from '@deps/contexts/transactions/AutopayContext';
import { useCasesQuery } from '@deps/hooks/useCasesQuery';
import { Processes } from '@deps/models/case/case';
import { validateSystematicProgramUpdate } from '@deps/queries/api/bpm';
import { TransactionStep } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    ArrangementType,
    Policy,
    Policy as PolicyView,
    Reason,
    SchemaEnum as TransactionTypeSchemaEnum,
    SystematicProgram,
} from '@zinnia/api-types/types/sor';

import Amount from './amount/amount';
import WithdrawalAmount from './amount/withdrawalAmount';
import {
    buildSystematicProgramUpdateRequestBody,
    getSystematicInfo,
    buildSystematicWithdrawalProgramUpdateRequestBody,
    getProcessSubTypes,
} from './autopay.helpers';
import Confirm from './confirm/confirm';
import ManageSummary from './summary/manage-summary';
import SetUpSummary from './summary/set-up-summary';

export type AutopayContainerProps = {
    arrangementType?: ArrangementType;
    isSetUp?: boolean;
    parentPage: ParentPage;
    policy: Policy;
    systematicProgramReason?: Reason;
    translationKeyPrefix: string;
};

const getTitle = ({
    isSetUp,
    t,
    translationKeyPrefix,
    systematicProgramTablesEnabled,
    parentPage,
    arrangementType,
}: {
    isSetUp: boolean;
    t: (key: string) => string;
    translationKeyPrefix: string;
    systematicProgramTablesEnabled: boolean;
    parentPage: ParentPage;
    arrangementType?: ArrangementType;
}): string => {
    if (isSetUp) {
        return t(
            `allFields.${translationKeyPrefix}${
                systematicProgramTablesEnabled
                    ? 'SystematicProgramTitleStart'
                    : 'TitleStart'
            }`
        );
    }
    let title = t(
        `allFields.${translationKeyPrefix}${
            systematicProgramTablesEnabled
                ? 'SystematicProgramManageStart'
                : 'ManageStart'
        }`
    );
    switch (parentPage) {
        case ParentPage.Withdrawals:
            if (arrangementType === ArrangementType.WITHDRAWAL) {
                title += ' Withdrawal';
            } else {
                title += ' RMD';
            }
            break;
        default:
            break;
    }
    return title;
};

const AutopayContainer = ({
    arrangementType,
    policy,
    isSetUp = false,
    parentPage,
    systematicProgramReason,
    translationKeyPrefix,
}: AutopayContainerProps) => {
    const { t } = useTranslation();
    const { autopay, setAutopay } = useAutopay();
    const { systematicPrograms } = policy;

    const startLabel = t(translationKeyPrefix + '.start.label');
    const amountLabel = t(translationKeyPrefix + '.amount.label');
    const payorLabel = t(translationKeyPrefix + '.payor.label');
    const paymentLabel = t(translationKeyPrefix + '.payment.label');
    const summaryLabel = t(translationKeyPrefix + '.summary.label');
    const confirmLabel = t(translationKeyPrefix + '.confirm.label');

    const { featureFlags } = useOptimizely();
    const wireCheckPaymentsEnabled =
        featureFlags[FEATURE_FLAGS.WITHDRAWAL_WIRE_CHECK_PAYMENTS];
    const systematicProgramTablesEnabled =
        featureFlags[FEATURE_FLAGS.SYSTEMATIC_PROGRAMS_TABLE];

    const processSubType = getProcessSubTypes(parentPage);
    const { data: casesResponse, isLoading } = useCasesQuery({
        policyNumber: policy.policyNumber,
        process: [Processes.SSW],
        requestSubType: processSubType.length ? processSubType : undefined,
        enabled: !!policy.policyNumber && !!featureFlags,
    });
    const hasCases =
        Array.isArray(casesResponse?.data) && casesResponse.data.length > 0;

    useEffect(() => {
        setAutopay((prevState) => ({
            ...prevState,
            arrangementType,
            parentPage,
            systematicProgramReason,
            translationKeyPrefix,
            isSetUp,
        }));
    }, [
        arrangementType,
        isSetUp,
        parentPage,
        setAutopay,
        systematicProgramReason,
        translationKeyPrefix,
    ]);

    const validateCall = useCallback(async () => {
        const { systematicProgram, arrangementId } = getSystematicInfo(
            systematicPrograms,
            systematicProgramReason,
            isSetUp
        );

        const query =
            parentPage == ParentPage.Withdrawals
                ? buildSystematicWithdrawalProgramUpdateRequestBody(
                      autopay,
                      systematicProgram as SystematicProgram
                  )
                : buildSystematicProgramUpdateRequestBody(
                      autopay,
                      systematicProgram as SystematicProgram
                  );
        const response = await validateSystematicProgramUpdate(
            policy.product?.planCode,
            policy.policyNumber || '',
            arrangementId,
            query
        );

        return response?.data;
    }, [
        systematicPrograms,
        systematicProgramReason,
        isSetUp,
        parentPage,
        autopay,
        policy.product?.planCode,
        policy.policyNumber,
    ]);

    const transactionType = useMemo(() => {
        if (parentPage === ParentPage.Premiums) {
            return TransactionTypeSchemaEnum.SUBSEQUENT_PREMIUM;
        }
        if (parentPage === ParentPage.Withdrawals) {
            if (isSetUp) {
                return TransactionTypeSchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP;
            }
            if (arrangementType === ArrangementType.WITHDRAWAL) {
                return TransactionTypeSchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL;
            }
            return TransactionTypeSchemaEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION;
        }
        return isSetUp
            ? TransactionTypeSchemaEnum.SYSTEMATIC_LOAN_REPAYMENT_SETUP
            : TransactionTypeSchemaEnum.SYSTEMATIC_LOAN_REPAYMENT;
    }, [isSetUp, parentPage, arrangementType]);

    autopay.arrangementType === ArrangementType.WITHDRAWAL
        ? 'Withdrawal'
        : 'RMD';

    let PaymentStepComponent = PaymentStep;
    if (parentPage === ParentPage.Withdrawals && wireCheckPaymentsEnabled) {
        PaymentStepComponent = PaymentStepMoneyOut;
    }

    const customFarmerCheck =
        systematicProgramReason == Reason.PREMIUM &&
        checkCustomPolicy(policy, CarrierCode.Farmers, FarmersPlanCodes);

    const steps: Step[] = useMemo(
        () => [
            {
                component: (
                    <StartStep
                        parentPage={parentPage}
                        policy={policy}
                        processType={Processes.SSW}
                        setState={setAutopay as StartStepSetState}
                        state={autopay}
                        subtitle={
                            !isSetUp &&
                            (parentPage === ParentPage.Premiums ||
                                parentPage === ParentPage.Loans)
                                ? t(
                                      translationKeyPrefix +
                                          '.start.subtitleManage'
                                  ) ?? ''
                                : undefined
                        }
                        title={getTitle({
                            isSetUp,
                            t,
                            translationKeyPrefix,
                            systematicProgramTablesEnabled,
                            parentPage,
                            arrangementType: autopay.arrangementType,
                        })}
                        trackEventProps={{
                            type: transactionType,
                            step: TransactionStep.Start,
                        }}
                        processSubType={processSubType}
                    />
                ),
                screenReaderLabel: startLabel,
                index: 0,
                text: startLabel,
                isVisible: () => hasCases,
            },
            {
                component:
                    parentPage === ParentPage.Withdrawals ? (
                        <WithdrawalAmount policy={policy} />
                    ) : (
                        <Amount
                            policy={policy}
                            customFarmerCheck={customFarmerCheck}
                        />
                    ),
                screenReaderLabel: amountLabel,
                index: 1,
                text: amountLabel,
                isVisible: () => true,
            },
            {
                component:
                    parentPage == ParentPage.Withdrawals ? (
                        <PayeesStep
                            parentPage={ParentPage.Withdrawals}
                            policy={policy as PolicyView}
                            setState={setAutopay as PayeesStepSetState}
                            state={autopay as any}
                            trackEventProps={{
                                type: transactionType,
                                step: TransactionStep.Payees,
                            }}
                        />
                    ) : (
                        <PayorStep
                            parentPage={parentPage}
                            policy={policy}
                            setState={setAutopay as PayorStepSetState}
                            state={autopay}
                            trackEventProps={{
                                type: transactionType,
                                step: TransactionStep.Payor,
                            }}
                        />
                    ),
                screenReaderLabel: payorLabel,
                index: 2,
                text: payorLabel,
                isVisible: () => true,
            },
            {
                component: (
                    <PaymentStepComponent
                        parentPage={parentPage}
                        policy={policy}
                        setState={setAutopay as PaymentStepSetState}
                        state={autopay}
                        validateTransaction={validateCall}
                        trackEventProps={
                            parentPage !== ParentPage.Withdrawals
                                ? {
                                      type: transactionType,
                                      step: TransactionStep.Payment,
                                  }
                                : undefined
                        }
                    />
                ),
                screenReaderLabel: paymentLabel,
                index: 3,
                text: paymentLabel,
                isVisible: () => true,
            },
            {
                component: isSetUp ? (
                    <SetUpSummary policy={policy} />
                ) : (
                    <ManageSummary policy={policy} />
                ),
                screenReaderLabel: summaryLabel,
                index: 4,
                text: summaryLabel,
                isVisible: () => true,
            },
            {
                component: <Confirm policy={policy} />,
                screenReaderLabel: confirmLabel,
                index: 5,
                text: confirmLabel,
                isVisible: () => true,
            },
        ],
        [
            parentPage,
            policy,
            isSetUp,
            setAutopay,
            autopay,
            t,
            startLabel,
            amountLabel,
            payorLabel,
            paymentLabel,
            summaryLabel,
            confirmLabel,
            customFarmerCheck,
            PaymentStepComponent,
            validateCall,
            transactionType,
            processSubType,
            hasCases,
            systematicProgramTablesEnabled,
            translationKeyPrefix,
        ]
    );

    const filteredSteps: Step[] = useMemo(
        () =>
            steps
                .filter((item: any) => item.isVisible?.())
                .map((item: any, index: number) => ({ ...item, index })),
        [steps]
    );

    return (
        <>
            {isLoading ? (
                <PageLoader variant={PageLoaderVariant.Center} />
            ) : (
                <WorkflowContainer policy={policy} steps={filteredSteps} />
            )}
        </>
    );
};

export default AutopayContainer;
