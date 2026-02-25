import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

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
import PayeeSummaryCard from '@deps/containers/payee-summary-card/payee-summary-card';
import { useWithdrawal } from '@deps/contexts/transactions/WithdrawalContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { getDisbursementPaymentForm } from '@deps/helpers/transactions/payment.helpers';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { ReactComponent as UserIcon } from '@deps/styles/elements/icons/actions/user.svg';
import {
    DEFAULT_DATE_FORMAT,
    NUMERIC_DATE_FORMAT,
} from '@deps/types/constants';
import { TransactionStep } from '@deps/types/segment-analytics';
import {
    Address,
    DisbursementPaymentForm,
    Policy,
    TransactionTypeEnum,
} from '@zinnia/api-types/types/sor';

import styles from './summary.module.css';

interface SummaryProps {
    policy: Policy;
}

const Summary = ({ policy }: SummaryProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'cancelFreeLook.summary',
    });
    const tCommon = useTranslation(TranslationFiles.COMMON).t;
    const { policyNumber, product } = policy;
    const { withdrawal } = useWithdrawal();
    const [isChecked, setIsChecked] = useState(false);
    const { goToNext } = useWorkflow();
    const {
        amount,
        effectiveDate,
        paymentAccountNumber,
        paymentAddress,
        paymentBranchName,
        paymentForm,
        payeeFullName,
        fboFfc,
    } = withdrawal;
    const { validationResponse } = withdrawal;
    const validationSucceeded =
        validationResponse?.status === TransactionResponseStatus.Success;
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
                    {t('status200subtitle')}
                </Typography>
                <div className="flex w-full flex-col">
                    <div className="h-6">
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t('effectiveDate')}
                            tooltipTitle={t('effectiveDate')}
                            tooltipBody={t('effectiveDateTooltip')}
                        />
                    </div>
                    <Typography variant={TypographyVariant.Value}>
                        {dayjs(effectiveDate, NUMERIC_DATE_FORMAT).format(
                            DEFAULT_DATE_FORMAT
                        )}
                    </Typography>
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
                        {t('payee')}
                    </Typography>
                </div>
                <PayeeSummaryCard
                    address={paymentAddress as Address}
                    accountNumber={paymentAccountNumber}
                    branchName={paymentBranchName}
                    classNames="max-w-[524px] lg:ml-8"
                    payeeName={payeeFullName}
                    paymentType={
                        getDisbursementPaymentForm(
                            paymentForm
                        ) as DisbursementPaymentForm
                    }
                    requestedAmountDollarAmount={numberFormatify(amount)}
                    showFinancialData={false}
                    fboFfc={fboFfc}
                />

                {!validationSucceeded && (
                    <div className={styles.validationContainer}>
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
                                <b>{tCommon('allFields.bpm500Error')}</b>
                            </BannerAlert>
                        )}
                        <div className={styles.checkboxContainer}>
                            <CheckboxText
                                label={tCommon(
                                    'allFields.submitWithErrorsText'
                                )}
                                checked={isChecked}
                                onChange={() => {
                                    setIsChecked(!isChecked);
                                }}
                            />
                        </div>
                        {isChecked && (
                            <AssistiveText
                                className={styles.errorMessage}
                                variant={AssistiveTextVariant.Error}
                                text={tCommon(
                                    'allFields.missingCheckToConfirm'
                                )}
                            />
                        )}
                    </div>
                )}
                <TransactionNavigationButtons
                    className="mt-10"
                    handleContinue={goToNext}
                    isSubmit={true}
                    parentPage={ParentPage.Withdrawals}
                    planCode={product?.planCode}
                    policyNumber={policyNumber}
                    submitLabel={t('submitCancellation') as string}
                    trackEventProps={{
                        type: TransactionTypeEnum.FREE_LOOK_CANCELLATION,
                        step: TransactionStep.Summary,
                    }}
                />
            </CardContainer>
        </div>
    );
};

export default Summary;
