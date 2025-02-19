import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import BannerAlert, { BannerVariant } from '@deps/components/banner-alert/banner-alert';
import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import ComparisonTable from '@deps/components/comparison-table/comparison-table';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { ACH, useLoanAutopay } from '@deps/contexts/transactions/LoanAutopayContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { buildFullNameFromParty, toTitleCase } from '@deps/helpers/string.helper';
import { getFrequency } from '@deps/helpers/systematic-program.helper';
import { Frequency, Policy, Reason } from '@deps/models/policy/sor-policy';
import { TransactionResponseStatus, ValidationResult } from '@deps/queries/api/bpm';
import { DEFAULT_EXTENDED_DATE_FORMAT, NUMERIC_DATE_FORMAT } from '@deps/types/constants';

interface SummaryProps {
    policy: Policy;
}

const ManageSummary = ({ policy }: SummaryProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'loanAutopay.summary' });
    const { t: defaultT } = useTranslation();
    const { autopay } = useLoanAutopay();
    const [showSelectionError, setShowSelectionError] = useState<boolean>(false);
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const { goToNext } = useWorkflow();

    const { policyNumber, product } = policy;
    const { paymentAmount, frequency, effectiveDate, paymentAccountNumber, paymentBranchName, payorFullName, validationResponse } = autopay;
    const validationSucceeded = useMemo(() => validationResponse?.status === TransactionResponseStatus.Success, [validationResponse]);
    const systematicProgram = policy.systematicPrograms?.find(sp => sp.reason === Reason.LOANREPAYMENT);
    const currentPayor = (systematicProgram?.party || [])[0];
    const currentPayorParty = policy?.parties?.find(party => party.partyId === currentPayor?.partyId);
    const currentPayorBank = currentPayorParty?.bankDetails?.find(bank => bank.bankId === currentPayor?.bankId);
    const comparisonData = [
        {
            header: '',
            new: t('newAutopayDetails'),
            current: t('current'),
        },
        {
            header: t('amount'),
            new: numberFormatify(paymentAmount),
            current: numberFormatify(systematicProgram?.amount),
        },
        {
            header: t('frequency'),
            new: toTitleCase(getFrequency(frequency, defaultT)),
            current: toTitleCase(getFrequency(systematicProgram?.frequency as Frequency, defaultT)),
        },
        {
            header: t('nextPaymentDate'),
            new: dayjs(effectiveDate, NUMERIC_DATE_FORMAT).format(DEFAULT_EXTENDED_DATE_FORMAT),
            current: dayjs(systematicProgram?.nextProgramDate, 'YYYY-MM-DD').format(DEFAULT_EXTENDED_DATE_FORMAT),
        },
        {
            header: t('payor'),
            new: payorFullName,
            current: buildFullNameFromParty(currentPayorParty),
        },
        {
            header: 'Banking details',
            new: {
                paymentType: ACH,
                branchName: paymentBranchName,
                accountNumber: paymentAccountNumber,
            },
            current: {
                paymentType: systematicProgram?.paymentForm,
                branchName: currentPayorBank?.branchName,
                accountNumber: currentPayorBank?.accountNumber,
            },
        },
    ];
    const bannerResults = validationResponse?.validationResult;

    const handleContinue = () => {
        if (!validationSucceeded && !isChecked) {
            setShowSelectionError(true);

            return;
        } else {
            setShowSelectionError(false);
            goToNext();
        }
    };

    return (
        <div className="responsive-padding rounded">
            <Typography variant={TypographyVariant.H1}>{t('label')}</Typography>
            <Typography className="mb-6 mt-2" variant={TypographyVariant.Body}>
                {validationSucceeded ? t('status200subtitle') : t('status400subtitle')}
            </Typography>
            <div>
                <div className="overflow-x-scroll">
                    <ComparisonTable comparisonData={comparisonData} />
                </div>

                {!validationSucceeded && (
                    <div className="mt-10 flex flex-col gap-2">
                        {bannerResults?.map((result: ValidationResult, index: number) => (
                            <BannerAlert key={index} variant={BannerVariant.Error} canDismiss={false}>
                                {result.error} {result.resolution}
                            </BannerAlert>
                        ))}
                        <div className="mt-6 flex flex-row">
                            <CheckboxText
                                label={t('submitWithErrorsText')}
                                checked={isChecked}
                                onChange={() => setIsChecked(!isChecked)}
                            />
                        </div>
                    </div>
                )}

                {showSelectionError && !isChecked && (
                    <AssistiveText variant={AssistiveTextVariant.Error} text={t('missingCheckToConfirm')} />
                )}

                <TransactionNavigationButtons
                    className='mt-10'
                    handleContinue={handleContinue}
                    isSubmit={true}
                    parentPage={ParentPage.Loans}
                    planCode={product?.planCode}
                    policyNumber={policyNumber}
                    submitLabel={
                        validationSucceeded ? (t('updateAutopay') as string) : (t('submit') as string)
                    }
                />
            </div>
        </div>
    );
};

export default ManageSummary;
