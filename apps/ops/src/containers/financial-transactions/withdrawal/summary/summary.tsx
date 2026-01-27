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
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import PayeeSummaryCard, {
    Charges,
} from '@deps/containers/payee-summary-card/payee-summary-card';
import { useWithdrawal } from '@deps/contexts/transactions/WithdrawalContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import {
    forcePositiveNumber,
    normalizeNumber,
    numberFormatify,
} from '@deps/helpers/numbers.helpers';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { getRequestedWithheldTaxesDisplay } from '@deps/helpers/tax-withholdings.helpers';
import { getReturnedWithheldTaxesDisplay } from '@deps/helpers/transactions/tax-withholdings.helpers';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import {
    DEFAULT_DATE_FORMAT,
    NUMERIC_DATE_FORMAT,
} from '@deps/types/constants';
import { TransactionStep } from '@deps/types/segment-analytics';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import {
    DisbursementType,
    TaxWithholdingType,
} from '@zinnia/api-types/types/bpm';
import {
    Address,
    Policy,
    TaxWithheldAmount,
    Transaction,
} from '@zinnia/api-types/types/sor';

import { WithdrawalType } from '../amount/types';
import { getOwnersTaxJurisdictionState } from '../taxes/taxes.helpers';

interface SummaryProps {
    policy: Policy;
}

const Summary = ({ policy }: SummaryProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'withdrawals.summary',
    });
    const { policyNumber, product } = policy;
    const { withdrawal } = useWithdrawal();

    const [showSelectionError, setShowSelectionError] =
        useState<boolean>(false);
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const { goToNext } = useWorkflow();
    const {
        amount,
        disbursementType,
        effectiveDate,
        paymentAccountNumber,
        paymentAddress,
        paymentBranchName,
        payeeFullName,
        taxWithholdingInstructions,
        validationResponse,
        paymentForm,
        fboFfc,
    } = withdrawal;

    const validationSucceeded = useMemo(
        () => validationResponse?.status === TransactionResponseStatus.Success,
        [validationResponse]
    );
    const ownerTaxState = getOwnersTaxJurisdictionState(policy);

    const withdrawalAmount =
        validationResponse?.quoteResponse?.payeeOrBeneficiary?.[0]
            .disbursementAmount;

    const totalWithdrawalAmount = numberFormatify(withdrawalAmount);

    const totalPayment =
        normalizeNumber(withdrawalAmount) < normalizeNumber(amount)
            ? totalWithdrawalAmount
            : numberFormatify(amount);

    const appliedAmount = validationResponse?.quoteResponse?.transactionAmounts
        ?.appliedAmount
        ? numberFormatify(
              Math.abs(
                  validationResponse?.quoteResponse?.transactionAmounts
                      ?.appliedAmount
              )
          )
        : numberFormatify(
              validationResponse?.quoteResponse?.transactionAmounts
                  ?.appliedAmount
          );

    const transactionType = useMemo(() => {
        return withdrawal.type === WithdrawalType.Surrender
            ? Transaction.transactionType.FULL_SURRENDER
            : Transaction.transactionType.PARTIAL_WITHDRAWAL_ONE_TIME;
    }, [withdrawal.type]);

    const handleContinue = async () => {
        if (!validationSucceeded && !isChecked) {
            setShowSelectionError(true);

            return;
        } else {
            setShowSelectionError(false);
            goToNext();
        }
    };

    return (
        <div>
            <CardContainer containerClassNames="border-b-2 border-gray-100">
                <Typography variant={TypographyVariant.H1}>
                    {t('label')}
                </Typography>
                <Typography
                    className="mb-6 mt-2"
                    variant={TypographyVariant.Body}
                >
                    {validationSucceeded
                        ? t('status200subtitle')
                        : t('status400subtitle')}
                </Typography>
                <div className="mb-8 flex w-full flex-row gap-8">
                    <div className="flex flex-col gap-2">
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t('effectiveDate')}
                            tooltipTitle={t('effectiveDate')}
                            tooltipBody={t('effectiveDateTooltip')}
                        />
                        <Typography variant={TypographyVariant.Value}>
                            {dayjs(effectiveDate, NUMERIC_DATE_FORMAT).format(
                                DEFAULT_DATE_FORMAT
                            )}
                        </Typography>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t('requestedWithdrawal')}
                            tooltipTitle={t('requestedWithdrawal', {
                                amount: numberFormatify(amount),
                            })}
                            tooltipBody={t('requestedWithdrawalTooltip')}
                        />
                        <Typography variant={TypographyVariant.Value}>
                            {numberFormatify(
                                forcePositiveNumber(
                                    validationResponse?.quoteResponse
                                        ?.transactionAmounts?.appliedAmount
                                )
                            )}
                        </Typography>
                        <Typography variant={TypographyVariant.Caption}>
                            {t('disbursement', {
                                type: toTitleCase(disbursementType),
                            })}
                        </Typography>
                    </div>

                    {disbursementType === DisbursementType.NET && (
                        <div className="flex flex-col gap-2">
                            <Label
                                variant={LabelVariant.FieldLabel}
                                label={t('actualWithdrawalAmount')}
                                tooltipTitle={t('actualWithdrawalAmount')}
                                tooltipBody={t('actualWithdrawalAmountTooltip')}
                            />
                            <Typography variant={TypographyVariant.Value}>
                                {appliedAmount}
                            </Typography>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t('totalPayment')}
                            tooltipTitle={t('totalPayment')}
                            tooltipBody={t('totalPaymentTooltip')}
                        />
                        <Typography variant={TypographyVariant.Value}>
                            {totalPayment}
                        </Typography>
                    </div>
                </div>
                <div className="flex w-full flex-row gap-8">
                    <div className="flex flex-col gap-2">
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t('withdrawalType')}
                        />
                        <Typography variant={TypographyVariant.BodyParagraph}>
                            {toTitleCase(withdrawal.type)}
                        </Typography>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t('fundDisbursementType')}
                            tooltipTitle={t('fundDisbursementType')}
                            tooltipBody={t('fundDisbursementTypeTooltip')}
                        />
                        <Typography variant={TypographyVariant.BodyParagraph}>
                            {t('proRata')}
                        </Typography>
                    </div>
                </div>
            </CardContainer>

            <CardContainer containerClassNames="border-b-2 border-gray-100">
                <Typography variant={TypographyVariant.H2} className="mb-4">
                    {t('taxes')}
                </Typography>

                <div className="flex gap-8">
                    <div className="flex gap-8">
                        <div className="flex flex-col gap-2">
                            <Label
                                variant={LabelVariant.FieldLabel}
                                label={t('federalTaxes')}
                                tooltipTitle={t('federalTaxes')}
                                tooltipBody={t('federalTaxesTooltip')}
                            />
                            <Typography
                                variant={TypographyVariant.BodyParagraph}
                            >
                                {getRequestedWithheldTaxesDisplay(
                                    taxWithholdingInstructions,
                                    TaxWithholdingType.FEDERAL,
                                    DEFAULT_ERROR_STRING
                                )}
                            </Typography>
                        </div>
                    </div>
                    <div className="flex gap-8">
                        <div className="flex flex-col gap-2">
                            <Label
                                variant={LabelVariant.FieldLabel}
                                label={t('stateTaxes', {
                                    state: ownerTaxState,
                                })}
                                sentenceCase={false}
                                tooltipTitle={t('stateTaxes', {
                                    state: ownerTaxState,
                                })}
                                tooltipBody={t('stateTaxesTooltip')}
                            />
                            <Typography
                                variant={TypographyVariant.BodyParagraph}
                            >
                                {getRequestedWithheldTaxesDisplay(
                                    taxWithholdingInstructions,
                                    TaxWithholdingType.STATE,
                                    DEFAULT_ERROR_STRING
                                )}
                            </Typography>
                        </div>
                    </div>
                </div>
            </CardContainer>
            <CardContainer>
                <Typography variant={TypographyVariant.H2} className="mb-4">
                    {t('payee')}
                </Typography>
                <PayeeSummaryCard
                    address={paymentAddress as Address}
                    accountNumber={paymentAccountNumber}
                    branchName={paymentBranchName}
                    classNames="max-w-[524px]"
                    disbursementType={
                        validationResponse?.quoteResponse?.transactionAmounts
                            ?.disbursementType
                    }
                    payeeName={payeeFullName}
                    paymentType={paymentForm}
                    ownerTaxState={ownerTaxState}
                    requestedAmountDollarAmount={numberFormatify(
                        forcePositiveNumber(
                            validationResponse?.quoteResponse
                                ?.transactionAmounts?.appliedAmount
                        )
                    )}
                    // TODO MG: confirm this comment is valid
                    // Hardcoded for MVP - get back null usually (should that be 100?)
                    totalAllocationAmount={totalPayment}
                    federalTaxDollarAmount={getReturnedWithheldTaxesDisplay(
                        (validationResponse?.quoteResponse
                            ?.taxWithheldAmounts as TaxWithheldAmount[]) || [],
                        TaxWithholdingType.FEDERAL,
                        DEFAULT_ERROR_STRING
                    )}
                    stateTaxDollarAmount={getReturnedWithheldTaxesDisplay(
                        (validationResponse?.quoteResponse
                            ?.taxWithheldAmounts as TaxWithheldAmount[]) || [],
                        TaxWithholdingType.STATE,
                        DEFAULT_ERROR_STRING
                    )}
                    // Hardcoded for MVP but should write a function to default to these values when charges is null
                    fboFfc={fboFfc}
                    charges={
                        (validationResponse?.quoteResponse
                            ?.charges as Charges[]) || []
                    }
                />

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
                                <b>{t('bpm500Error')}</b>
                            </BannerAlert>
                        )}
                        <div className="flex flex-row">
                            <CheckboxText
                                label={t('submitWithErrorsText')}
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
                        text={t('missingCheckToConfirm')}
                    />
                )}

                <TransactionNavigationButtons
                    className="mt-10"
                    handleContinue={handleContinue}
                    isSubmit={true}
                    parentPage={ParentPage.Withdrawals}
                    planCode={product?.planCode}
                    policyNumber={policyNumber}
                    submitLabel={t('submitWithdrawal') as string}
                    trackEventProps={{
                        type: transactionType,
                        step: TransactionStep.Summary,
                    }}
                />
            </CardContainer>
        </div>
    );
};

export default Summary;
