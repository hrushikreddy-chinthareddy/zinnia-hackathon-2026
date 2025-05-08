import { TransactionType } from '@zinnia/api-types/types/sor';
import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BannerAlert, { BannerVariant } from '@deps/components/banner-alert/banner-alert';
import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Label, { LabelVariant } from '@deps/components/label/label';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useFundTransfer } from '@deps/contexts/transactions/FundTransferContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { numberFormatify, percentFormatify } from '@deps/helpers/numbers.helpers';
import { AmountType } from '@deps/models/funds/enums';
import { Policy } from '@deps/models/policy/sor-policy';
import { TransactionResponseStatus, ValidationResult } from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { DEFAULT_DATE_FORMAT, NUMERIC_DATE_FORMAT } from '@deps/types/constants';
import { TransactionStep } from '@deps/types/segment-analytics';

interface SummaryProps {
    policy: Policy;
    title: string;
    subtitle?: string;
}

const Summary = ({ policy, title }: SummaryProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'fundTransfer.summary' });
    const { goToNext } = useWorkflow();

    const { fundTransfer } = useFundTransfer();
    const [showSelectionError, setShowSelectionError] = useState<boolean>(false);
    const [isChecked, setIsChecked] = useState<boolean>(false);

    const { effectiveDate, validationResponse } = fundTransfer;
    const { policyNumber, product } = policy;

    const transferType = fundTransfer?.transactionAmounts?.amountType;

    const formatAmount = (value: number | string, type: string) => {
        return type === AmountType.Amount ? numberFormatify(value || 0) : percentFormatify(value || 0, { isInteger: true });
    };

    const validationSucceeded = useMemo(() => validationResponse?.status === TransactionResponseStatus.Success, [validationResponse]);

    const bannerResults = validationResponse?.validationResult;
    const statusResponse = validationResponse?.status;
    const internalServerCTA = {
        text: t('internal500CTAlinkText'),
        href: t('internal500CTAlink'),
    };

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
        <WorkflowCard
            title={title}
            subtitle={validationSucceeded ? t('status200subtitle') || '' : t('status400subtitle') || ''}
            footerContent={
                <TransactionNavigationButtons
                    disableContinue={statusResponse === StatusCode.InternalServerError}
                    handleContinue={handleContinue}
                    planCode={product?.planCode}
                    policyNumber={policyNumber}
                    parentPage={ParentPage.Funds}
                    trackEventProps={{ type: TransactionType.FUND_TRANSFER, step: TransactionStep.Summary }}
                />
            }
        >
            <div className="flex flex-col">
                <div className="flex flex-col mt-2 mb-6">
                    <Label className="mb-2" variant={LabelVariant.LabelMd} label={t('effectiveDateLabel')} />
                    <Typography variant={TypographyVariant.Value}>
                        {dayjs(effectiveDate, NUMERIC_DATE_FORMAT).format(DEFAULT_DATE_FORMAT)}
                    </Typography>
                </div>

                <Label className="mb-4 " variant={LabelVariant.LabelMd} label={t('activity')} />
                <div>
                    <div className="overflow-hidden border border-#CCCCCC rounded-lg">
                        <table className="min-w-full text-sm divide-y divide-[#CCCCCC]">
                            <thead className="bg-[#F8F8F8]">
                                <tr>
                                    <th className="px-4 py-2 text-left w-2/6">{t('transferedFrom')}</th>
                                    <th className="px-4 py-2 text-right w-1/6">
                                        {transferType === 'AMOUNT' ? t('amount') : t('percentage')}
                                    </th>
                                    <th className="px-4 py-2 text-left  border-l border-[#CCCCCC] w-2/6">{t('transferedTo')}</th>
                                    <th className="px-8 py-2 text-right  w-1/6">
                                        {transferType === 'AMOUNT' ? t('amount') : t('percentage')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-[#CCCCCC]">
                                {fundTransfer.funds.transferTo
                                    .filter(({ fundName, requestedAmount }) => fundName && Number(requestedAmount))
                                    .map((to, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 text-left">
                                                {index === 0 && fundTransfer.funds.transferFrom[0]?.fundName}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                {index === 0 &&
                                                    formatAmount(fundTransfer.funds.transferFrom[0]?.requestedAmount, transferType)}
                                            </td>
                                            <td className="px-4 py-2 text-left border-l border-[#CCCCCC]">{to.fundName}</td>
                                            <td className="px-8 py-2 text-right">{formatAmount(to.requestedAmount || 0, transferType)}</td>
                                        </tr>
                                    ))}
                                <tr className="font-semibold">
                                    <td className="px-4 py-2 text-left">
                                        {transferType === 'AMOUNT' ? t('totalTransferAmount') : t('totalTransferPercent')}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        {formatAmount(fundTransfer.funds.transferFrom[0]?.requestedAmount, transferType)}
                                    </td>
                                    <td className="px-4 py-2 text-left border-l border-[#CCCCCC]">
                                        {transferType === 'AMOUNT' ? t('totalTransferAmount') : t('totalTransferPercent')}
                                    </td>
                                    <td className="px-8 py-2 text-right">
                                        {formatAmount(
                                            fundTransfer.funds.transferTo.reduce((sum, to) => sum + Number(to.requestedAmount || 0), 0),
                                            transferType
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {!validationSucceeded && (
                        <div className="mt-10 flex flex-col gap-2">
                            {statusResponse === StatusCode.InternalServerError ? (
                                bannerResults?.map((result: ValidationResult, index: number) => (
                                    <BannerAlert
                                        key={index}
                                        variant={BannerVariant.Error}
                                        canDismiss={false}
                                        cta={statusResponse === StatusCode.InternalServerError ? internalServerCTA : undefined}
                                    >
                                        {t('internal500Error')}
                                    </BannerAlert>
                                ))
                            ) : (
                                <>
                                    {bannerResults?.map((result: ValidationResult, index: number) => (
                                        <BannerAlert key={index} variant={BannerVariant.Error} canDismiss={false}>
                                            {result.error} {result.resolution}
                                        </BannerAlert>
                                    ))}
                                    <div className="my-6 flex flex-row">
                                        <CheckboxText
                                            label={t('submitWithErrorsText')}
                                            checked={isChecked}
                                            onChange={() => setIsChecked(!isChecked)}
                                        />
                                    </div>
                                </>
                            )}
                            {showSelectionError && !isChecked && (
                                <AssistiveText variant={AssistiveTextVariant.Error} text={t('missingCheckToConfirm')} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </WorkflowCard>
    );
};

export default Summary;
