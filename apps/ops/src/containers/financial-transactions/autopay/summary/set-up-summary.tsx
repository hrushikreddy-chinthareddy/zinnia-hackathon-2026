import { toTitleCase } from '@zinnia/utils';
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
import { ACH, useAutopay } from '@deps/contexts/transactions/AutopayContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { getFrequency } from '@deps/helpers/systematic-program.helper';
import { Policy } from '@deps/models/policy/sor-policy';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { ReactComponent as UserIcon } from '@deps/styles/elements/icons/actions/user.svg';
import { DEFAULT_DATE_FORMAT, NUMERIC_DATE_FORMAT } from '@deps/types/constants';

interface SummaryProps {
    policy: Policy;
}

const SetUpSummary = ({ policy }: SummaryProps) => {
    const { autopay } = useAutopay();
    const { parentPage, translationKeyPrefix } = autopay;

    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: `${translationKeyPrefix}.summary` });
    const { t: defaultT } = useTranslation();
    const { policyNumber, product } = policy;

    const [showSelectionError, setShowSelectionError] = useState<boolean>(false);
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const { goToNext } = useWorkflow();
    const { paymentAmount, effectiveDate, frequency, paymentAccountNumber, paymentBranchName, payorFullName, validationResponse } = autopay;

    const validationSucceeded = useMemo(() => validationResponse?.status === TransactionResponseStatus.Success, [validationResponse]);

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
                <Typography variant={TypographyVariant.H1}>{t('label')}</Typography>
                <Typography className="mb-4 mt-2" variant={TypographyVariant.Body}>
                    {validationSucceeded ? t('status200subtitle') : t('status400subtitle')}
                </Typography>
                <div className="flex w-full flex-row gap-8">
                    <div className="flex flex-col gap-1">
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t('autopayAmount')}
                        />
                        <Typography variant={TypographyVariant.Value}>{numberFormatify(paymentAmount)}</Typography>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t('paymentFrequency')}
                        />
                        <Typography variant={TypographyVariant.Value}>
                            {toTitleCase(getFrequency(frequency, defaultT))}
                        </Typography>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t('paymentStartDate')}
                        />
                        <Typography variant={TypographyVariant.Value}>
                            {dayjs(effectiveDate, NUMERIC_DATE_FORMAT).format(DEFAULT_DATE_FORMAT)}
                        </Typography>
                    </div>
                </div>
            </CardContainer>
            <CardContainer>
                <div className="mb-4 flex flex-row items-center">
                    <UserIcon className="mr-2 text-primary" height={24} width={24} />
                    <Typography variant={TypographyVariant.H2} className="mr-5">
                        {t('payor')}
                    </Typography>
                </div>
                <PayeeSummaryCard
                    accountNumber={paymentAccountNumber}
                    branchName={paymentBranchName}
                    classNames="max-w-[524px]"
                    payeeName={payorFullName}
                    paymentType={ACH}
                    showFinancialData={false}
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
                                <b>{t('bpm500Error')}</b>
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
                    parentPage={parentPage as ParentPage}
                    planCode={product?.planCode}
                    policyNumber={policyNumber}
                    submitLabel={t('submit') as string}
                />
            </CardContainer>
        </div>
    );
};

export default SetUpSummary;
