import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';

import Label, { LabelVariant } from '@deps/components/label/label';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import PayeeSummaryCard from '@deps/containers/payee-summary-card/payee-summary-card';
import { ACH, useWithdrawal } from '@deps/contexts/WithdrawalContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { Policy } from '@deps/models/policy/sor-policy';
import { ReactComponent as UserIcon } from '@deps/styles/elements/icons/actions/user.svg';
import { DEFAULT_DATE_FORMAT, NUMERIC_DATE_FORMAT } from '@deps/types/constants';
interface SummaryProps {
    policy: Policy;
}

const Summary = ({ policy }: SummaryProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'cancelFreelook.summary' });
    const { policyNumber, product } = policy;
    const { withdrawal } = useWithdrawal();

    const { goToNext } = useWorkflow();
    const { amount, effectiveDate, paymentAccountNumber, paymentBranchName, payeeFullName } = withdrawal;

    return (
        <div>
            <CardContainer containerClassNames="border-b-2 border-gray-100">
                <Typography variant={TypographyVariant.H1}>{t('label')}</Typography>
                <Typography className="mb-6 mt-2" variant={TypographyVariant.Body}>
                    {t('status200subtitle')}
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
                    payeeName={payeeFullName}
                    paymentType={ACH}
                    requestedAmountDollarAmount={numberFormatify(amount)}
                    showFinancialData={false}
                />

                <TransactionNavigationButtons
                    className="mt-10"
                    handleContinue={goToNext}
                    isSubmit={true}
                    parentPage={ParentPage.Withdrawals}
                    planCode={product?.planCode}
                    policyNumber={policyNumber}
                    submitLabel={t('submitPayment') as string}
                />
            </CardContainer>
        </div>
    );
};

export default Summary;
