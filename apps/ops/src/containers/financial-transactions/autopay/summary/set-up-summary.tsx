import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import BannerAlert, {
    BannerVariant,
} from '@deps/components/banner-alert/banner-alert';
import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Label, { LabelVariant } from '@deps/components/label/label';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import PayeeSummaryCard from '@deps/containers/payee-summary-card/payee-summary-card';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useAutopay } from '@deps/contexts/transactions/AutopayContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { getFrequency } from '@deps/helpers/systematic-program.helpers';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { ReactComponent as UserIcon } from '@deps/styles/elements/icons/actions/user.svg';
import {
    DEFAULT_DATE_FORMAT,
    NUMERIC_DATE_FORMAT,
} from '@deps/types/constants';
import { TransactionStep } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { toTitleCase } from '@deps/utils/strings';
import {
    Address,
    ArrangementType,
    Policy,
    TransactionType,
} from '@zinnia/api-types/types/sor';

interface SummaryProps {
    policy: Policy;
}

const SetUpSummary = ({ policy }: SummaryProps) => {
    const { autopay } = useAutopay();
    const { parentPage, translationKeyPrefix } = autopay;

    const { t } = useTranslation();
    const { policyNumber, product } = policy;

    const { featureFlags } = useOptimizely();
    const systematicProgramTablesEnabled =
        featureFlags[FEATURE_FLAGS.SYSTEMATIC_PROGRAMS_TABLE];

    const [showSelectionError, setShowSelectionError] =
        useState<boolean>(false);
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const { goToNext } = useWorkflow();
    const {
        isSetUp,
        paymentAmount,
        effectiveDate,
        frequency,
        paymentAccountNumber,
        paymentBranchName,
        payorFullName,
        validationResponse,
        arrangementType,
        payeeFullName,
        paymentAddress,
        paymentForm,
        fboFfc,
    } = autopay;

    const validationSucceeded = useMemo(
        () => validationResponse?.status === TransactionResponseStatus.Success,
        [validationResponse]
    );

    const transactionType = useMemo(() => {
        return parentPage === ParentPage.Premiums
            ? TransactionType.SUBSEQUENT_PREMIUM
            : isSetUp
            ? TransactionType.SYSTEMATIC_LOAN_REPAYMENT_SETUP
            : TransactionType.SYSTEMATIC_LOAN_REPAYMENT;
    }, [isSetUp, parentPage]);

    const handleContinue = async () => {
        if (!validationSucceeded && !isChecked) {
            setShowSelectionError(true);
            return;
        } else {
            setShowSelectionError(false);
            goToNext();
        }
    };

    const isWithdrawalAutopay = parentPage === ParentPage.Withdrawals;
    const conditionalClass = isWithdrawalAutopay
        ? 'flex flex-col gap-1'
        : 'hidden';

    return (
        <div>
            <CardContainer containerClassNames="border-b-2 border-gray-100">
                <Typography variant={TypographyVariant.H1}>
                    {t(`${translationKeyPrefix}.summary.label`)}
                </Typography>
                <Typography
                    className="mb-4 mt-2"
                    variant={TypographyVariant.Body}
                >
                    {validationSucceeded
                        ? t(`${translationKeyPrefix}.summary.status200subtitle`)
                        : t(
                              `${translationKeyPrefix}.summary.status400subtitle`
                          )}
                </Typography>
                <div className="flex w-full flex-row gap-8">
                    <div className={conditionalClass}>
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t(
                                `${translationKeyPrefix}.summary.distributionType`
                            )}
                        />
                        <Typography variant={TypographyVariant.Value}>
                            {arrangementType == ArrangementType.WITHDRAWAL
                                ? 'Withdrawal'
                                : 'RMD'}
                        </Typography>
                    </div>
                    <div className={conditionalClass}>
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t(`${translationKeyPrefix}.summary.type`)}
                        />
                        <Typography variant={TypographyVariant.Value}>
                            {'Dollar'}
                        </Typography>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t(
                                systematicProgramTablesEnabled
                                    ? `allFields.${translationKeyPrefix}SummarySystematicProgramAmount`
                                    : `allFields.${translationKeyPrefix}SummaryAutopayAmount`
                            )}
                        />
                        <Typography variant={TypographyVariant.Value}>
                            {numberFormatify(paymentAmount)}
                        </Typography>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t(
                                `${translationKeyPrefix}.summary.paymentFrequency`
                            )}
                        />
                        <Typography variant={TypographyVariant.Value}>
                            {toTitleCase(getFrequency(frequency, t))}
                        </Typography>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t(
                                `${translationKeyPrefix}.summary.paymentStartDate`
                            )}
                        />
                        <Typography variant={TypographyVariant.Value}>
                            {dayjs(effectiveDate, NUMERIC_DATE_FORMAT).format(
                                DEFAULT_DATE_FORMAT
                            )}
                        </Typography>
                    </div>
                    <div className={conditionalClass}>
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t(
                                `${translationKeyPrefix}.summary.fundDisbursementType`
                            )}
                        />
                        <Typography variant={TypographyVariant.Value}>
                            {'Pro rata'}
                        </Typography>
                    </div>
                </div>
            </CardContainer>
            <CardContainer>
                <div className="mb-4 flex flex-row items-center">
                    <UserIcon
                        className="mr-2 text-primary"
                        height={24}
                        width={24}
                    />
                    <Typography variant={TypographyVariant.H2} className="mr-5">
                        {t(`${translationKeyPrefix}.summary.payor`)}
                    </Typography>
                </div>
                {isWithdrawalAutopay ? (
                    <PayeeSummaryCard
                        address={paymentAddress as Address}
                        accountNumber={paymentAccountNumber}
                        branchName={paymentBranchName}
                        classNames="max-w-[524px]"
                        payeeName={payeeFullName}
                        showFinancialData={false}
                        paymentType={paymentForm}
                        fboFfc={fboFfc}
                    />
                ) : (
                    <PayeeSummaryCard
                        accountNumber={paymentAccountNumber}
                        branchName={paymentBranchName}
                        classNames="max-w-[524px]"
                        payeeName={payorFullName}
                        paymentType={paymentForm}
                        showFinancialData={false}
                    />
                )}
                {!validationSucceeded && (
                    <div className="mt-10 flex flex-col gap-6">
                        {validationResponse?.validationResult ? (
                            validationResponse?.validationResult?.map(
                                (validationResult) => {
                                    const { error, errorCode, resolution } =
                                        validationResult;

                                    return (
                                        <BannerAlert
                                            canDismiss={false}
                                            key={`bpm-validation-banner-${errorCode}`}
                                            variant={BannerVariant.Error}
                                        >
                                            <b>{error}</b> {resolution}
                                        </BannerAlert>
                                    );
                                }
                            )
                        ) : (
                            <BannerAlert
                                canDismiss={false}
                                variant={BannerVariant.Error}
                            >
                                <b>
                                    {t(
                                        `${translationKeyPrefix}.summary.bpm500Error`
                                    )}
                                </b>
                            </BannerAlert>
                        )}
                        <div className="flex flex-row">
                            <CheckboxText
                                label={t(
                                    `${translationKeyPrefix}.summary.submitWithErrorsText`
                                )}
                                checked={isChecked}
                                onChange={() => setIsChecked(!isChecked)}
                            />
                        </div>
                    </div>
                )}

                {showSelectionError && !isChecked && (
                    <AssistiveText
                        className="mt-2"
                        variant={AssistiveTextVariant.Error}
                        text={t(
                            `${translationKeyPrefix}.summary.missingCheckToConfirm`
                        )}
                    />
                )}

                <TransactionNavigationButtons
                    className="mt-10"
                    handleContinue={handleContinue}
                    isSubmit={true}
                    parentPage={parentPage as ParentPage}
                    planCode={product?.planCode}
                    policyNumber={policyNumber}
                    submitLabel={
                        t(
                            systematicProgramTablesEnabled
                                ? `allFields.${translationKeyPrefix}SummarySubmit`
                                : `${translationKeyPrefix}.summary.submit`
                        ) ?? ''
                    }
                    trackEventProps={{
                        type: transactionType,
                        step: TransactionStep.Summary,
                    }}
                />
            </CardContainer>
        </div>
    );
};

export default SetUpSummary;
