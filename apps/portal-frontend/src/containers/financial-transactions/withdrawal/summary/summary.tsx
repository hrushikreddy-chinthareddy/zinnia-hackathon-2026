import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import BannerAlert, { BannerVariant } from '@deps/components/banner-alert/banner-alert';
import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Label, { LabelVariant } from '@deps/components/label/label';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import PayeeSummaryCard from '@deps/containers/payee-summary-card/payee-summary-card';
import { ACH, useWithdrawal } from '@deps/contexts/WithdrawalContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { numberFormatify, percentFormatify } from '@deps/helpers/numbers.helper';
import { toTitleCase } from '@deps/helpers/string.helper';
import { DisbursementType, Policy, TaxRateToUse, TaxWithholdingType } from '@deps/models/policy/sor-policy';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { ReactComponent as UserIcon } from '@deps/styles/elements/icons/actions/user.svg';
import { DEFAULT_DATE_FORMAT, DEFAULT_ERROR_STRING, NUMERIC_DATE_FORMAT } from '@deps/types/constants';

import { getOwnersTaxJurisdictionState } from '../taxes/taxes.helpers';

interface SummaryProps {
    policy: Policy;
}

const Summary = ({ policy }: SummaryProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'withdrawals.summary' });
    const { policyNumber, product } = policy;
    const { withdrawal } = useWithdrawal();

    const [showSelectionError, setShowSelectionError] = useState<boolean>(false);
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const { goToNext } = useWorkflow();
    const {
        amount,
        disbursementType,
        effectiveDate,
        paymentAccountNumber,
        paymentBranchName,
        payeeFullName,
        taxWithholdingInstructions,
        validationResponse,
    } = withdrawal;

    const validationSucceeded = useMemo(() => validationResponse?.status === TransactionResponseStatus.Success, [validationResponse]);
    const ownerTaxState = getOwnersTaxJurisdictionState(policy);
    const totalPayment = numberFormatify(validationResponse?.quoteResponse?.payeeOrBeneficiary?.[0].disbursementAmount);
    const appliedAmount = validationResponse?.quoteResponse?.transactionAmounts?.appliedAmount
        ? numberFormatify(Math.abs(validationResponse?.quoteResponse?.transactionAmounts?.appliedAmount))
        : numberFormatify(validationResponse?.quoteResponse?.transactionAmounts?.appliedAmount);

    const handleContinue = async () => {
        if (!validationSucceeded && !isChecked) {
            setShowSelectionError(true);

            return;
        } else {
            setShowSelectionError(false);
            goToNext();
        }
    };

    const getRequestedWithheldTaxesDisplay = (withholdingType: TaxWithholdingType): string => {
        const withholding = taxWithholdingInstructions?.find(tw => tw.taxWithholdingType === withholdingType);

        if (!withholding) {
            return DEFAULT_ERROR_STRING;
        }

        if (withholding?.taxRateToUse === TaxRateToUse.USEDEFAULTTABLE) {
            if (withholdingType === TaxWithholdingType.FEDERAL) return t('minRequiredPercent', { percent: '10' });
            else return t('minRequired');
        }

        if (withholding?.taxRateToUse === TaxRateToUse.NOWITHHOLDINGELECTED) {
            return t('doNotWithhold');
        }

        return withholding.dollar ? numberFormatify(withholding.dollar) : percentFormatify(withholding.percentage, { isInteger: true });
    };

    const getReturnedWithheldTaxesDisplay = (withholdingType: TaxWithholdingType): string => {
        const withheldAmount = validationResponse?.quoteResponse?.taxWithheldAmounts?.find(tw => tw.taxWithholdingType === withholdingType);
        // @ts-expect-error API is returning withholdAmount instead of withheldAmount
        if (!withheldAmount?.withholdAmount) {
            return DEFAULT_ERROR_STRING;
        }
        // @ts-expect-error API is returning withholdAmount instead of withheldAmount
        return numberFormatify(withheldAmount.withholdAmount);
    };

    return (
        <div>
            <CardContainer containerClassNames="border-b-2 border-gray-100">
                <Typography variant={TypographyVariant.H1}>{t('label')}</Typography>
                <Typography className="mb-6 mt-2" variant={TypographyVariant.Body}>
                    {validationSucceeded ? t('status200subtitle') : t('status400subtitle')}
                </Typography>
                <div className="mb-8 flex w-full flex-row gap-8">
                    <div className="flex flex-col">
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t('effectiveDate')}
                            tooltipTitle={t('effectiveDate')}
                            tooltipBody={t('effectiveDateTooltip')}
                        />
                        <Typography variant={TypographyVariant.Value}>
                            {dayjs(effectiveDate, NUMERIC_DATE_FORMAT).format(DEFAULT_DATE_FORMAT)}
                        </Typography>
                    </div>

                    <div className="flex flex-col">
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t('requestedWithdrawal')}
                            tooltipTitle={t('requestedWithdrawal', { amount: numberFormatify(amount) })}
                            tooltipBody={t('requestedWithdrawalTooltip')}
                        />
                        <Typography variant={TypographyVariant.Value}>{numberFormatify(amount)}</Typography>
                        <Typography variant={TypographyVariant.Caption}>
                            {t('disbursement', { type: toTitleCase(disbursementType) })}
                        </Typography>
                    </div>

                    {disbursementType === DisbursementType.NET && (
                        <div className="flex flex-col">
                            <Label
                                variant={LabelVariant.FieldLabel}
                                label={t('actualWithdrawalAmount')}
                                tooltipTitle={t('actualWithdrawalAmount')}
                                tooltipBody={t('actualWithdrawalAmountTooltip')}
                            />
                            <Typography variant={TypographyVariant.Value}>{appliedAmount}</Typography>
                        </div>
                    )}

                    <div className="flex flex-col">
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t('totalPayment')}
                            tooltipTitle={t('totalPayment')}
                            tooltipBody={t('totalPaymentTooltip')}
                        />
                        <Typography variant={TypographyVariant.Value}>{totalPayment}</Typography>
                    </div>
                </div>
                <div className="flex w-full flex-row gap-8">
                    <div className="flex flex-col">
                        <Label variant={LabelVariant.FieldLabel} label={t('withdrawalType')} />
                        <Typography variant={TypographyVariant.BodyParagraph}>{toTitleCase(withdrawal.type)}</Typography>
                    </div>

                    <div className="flex flex-col">
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t('fundDisbursementType')}
                            tooltipTitle={t('fundDisbursementType')}
                            tooltipBody={t('fundDisbursementTypeTooltip')}
                        />
                        <Typography variant={TypographyVariant.BodyParagraph}>{t('proRata')}</Typography>
                    </div>
                </div>
            </CardContainer>

            <CardContainer containerClassNames="border-b-2 border-gray-100">
                <div className="mb-4 flex flex-row items-center">
                    <UserIcon className="mr-2 text-primary" height={24} role="presentation" width={24} />
                    <Typography variant={TypographyVariant.H2}>{t('taxes')}</Typography>
                </div>

                <div className="flex gap-8 lg:ml-8">
                    <div className="flex gap-8">
                        <div className="flex flex-col">
                            <Label
                                variant={LabelVariant.FieldLabel}
                                label={t('federalTaxes')}
                                tooltipTitle={t('federalTaxes')}
                                tooltipBody={t('federalTaxesTooltip')}
                            />
                            <Typography variant={TypographyVariant.BodyParagraph}>
                                {getRequestedWithheldTaxesDisplay(TaxWithholdingType.FEDERAL)}
                            </Typography>
                        </div>
                    </div>
                    <div className="flex gap-8">
                        <div className="flex flex-col">
                            <Label
                                variant={LabelVariant.FieldLabel}
                                label={t('stateTaxes', { state: ownerTaxState })}
                                sentenceCase={false}
                                tooltipTitle={t('stateTaxes', { state: ownerTaxState })}
                                tooltipBody={t('stateTaxesTooltip')}
                            />
                            <Typography variant={TypographyVariant.BodyParagraph}>
                                {getRequestedWithheldTaxesDisplay(TaxWithholdingType.STATE)}
                            </Typography>
                        </div>
                    </div>
                </div>
            </CardContainer>
            <CardContainer>
                <div className="mb-4 flex flex-row items-center">
                    <UserIcon className="mr-2 text-primary" height={24} width={24} />
                    <Typography variant={TypographyVariant.H2} className="mr-5">
                        {t('payee')}
                    </Typography>
                </div>
                <PayeeSummaryCard
                    accountNumber={paymentAccountNumber}
                    branchName={paymentBranchName}
                    classNames="max-w-[524px] lg:ml-8"
                    disbursementType={validationResponse?.quoteResponse?.transactionAmounts?.disbursementType}
                    payeeName={payeeFullName}
                    paymentType={ACH}
                    ownerTaxState={ownerTaxState}
                    requestedAmountDollarAmount={numberFormatify(amount)}
                    // Hardcoded for MVP - get back null usually (should that be 100?)
                    totalAllocationAmount={totalPayment}
                    federalTaxDollarAmount={getReturnedWithheldTaxesDisplay(TaxWithholdingType.FEDERAL)}
                    stateTaxDollarAmount={getReturnedWithheldTaxesDisplay(TaxWithholdingType.STATE)}
                    // Hardcoded for MVP but should write a function to default to these values when charges is null
                    withdrawalChargeDollarAmount="$0.00"
                />

                {!validationSucceeded && (
                    <div className="mt-10 flex flex-col gap-6">
                        {validationResponse?.validationResult ? (
                            validationResponse?.validationResult?.map(validationResult => {
                                const { error, errorCode, resolution } = validationResult;

                                return (
                                    <BannerAlert
                                        canDismiss={false}
                                        key={`bpm-validation-banner-${errorCode}`}
                                        variant={BannerVariant.Error}
                                    >
                                        <b>{error}</b> {resolution}
                                    </BannerAlert>
                                );
                            })
                        ) : (
                            <BannerAlert canDismiss={false} variant={BannerVariant.Error}>
                                <b>Unknown Issue</b>
                            </BannerAlert>
                        )}
                        <div className="flex flex-row">
                            <CheckboxText label={t('submitWithErrorsText')} checked={isChecked} onChange={() => setIsChecked(!isChecked)} />
                        </div>
                    </div>
                )}

                {showSelectionError && !isChecked && (
                    <AssistiveText className="mt-2" variant={AssistiveTextVariant.Error} text={t('missingCheckToConfirm')} />
                )}

                <TransactionNavigationButtons
                    className="mt-10"
                    handleContinue={handleContinue}
                    isSubmit={true}
                    parentPage={ParentPage.Withdrawals}
                    planCode={product?.planCode}
                    policyNumber={policyNumber}
                    submitLabel={t('submitWithdrawal') as string}
                />
            </CardContainer>
        </div>
    );
};

export default Summary;
