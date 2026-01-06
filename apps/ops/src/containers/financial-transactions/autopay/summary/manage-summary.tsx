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
import ComparisonTable from '@deps/components/comparison-table/comparison-table';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useAutopay } from '@deps/contexts/transactions/AutopayContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import {
    buildFullNameFromParty,
    toTitleCase,
} from '@deps/helpers/string.helpers';
import { getFrequency } from '@deps/helpers/systematic-program.helpers';
import {
    TransactionResponseStatus,
    ValidationResult,
} from '@deps/queries/api/bpm';
import {
    DEFAULT_EXTENDED_DATE_FORMAT,
    NUMERIC_DATE_FORMAT,
} from '@deps/types/constants';
import { TransactionStep } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    ArrangementType,
    Frequency,
    Policy,
    TransactionType,
} from '@zinnia/api-types/types/sor';

interface SummaryProps {
    policy: Policy;
}

const ManageSummary = ({ policy }: SummaryProps) => {
    const { autopay } = useAutopay();
    const {
        parentPage,
        systematicProgramReason,
        translationKeyPrefix,
        paymentAmount,
        frequency,
        effectiveDate,
        paymentAccountNumber,
        paymentBranchName,
        payorFullName,
        validationResponse,
        arrangementType,
        fboFfc,
        paymentForm,
        payeeFullName,
        paymentAddress,
    } = autopay;

    const { t } = useTranslation();

    const { featureFlags } = useOptimizely();
    const systematicProgramTablesEnabled =
        featureFlags[FEATURE_FLAGS.SYSTEMATIC_PROGRAMS_TABLE];

    const [showSelectionError, setShowSelectionError] =
        useState<boolean>(false);
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const { goToNext } = useWorkflow();

    const { policyNumber, product } = policy;
    const validationSucceeded = useMemo(
        () => validationResponse?.status === TransactionResponseStatus.Success,
        [validationResponse]
    );

    // TODO MG: this is duped three times at least
    const transactionType = useMemo(() => {
        return parentPage === ParentPage.Premiums
            ? TransactionType.SUBSEQUENT_PREMIUM
            : TransactionType.SYSTEMATIC_LOAN_REPAYMENT;
    }, [parentPage]);

    const systematicProgram = policy.systematicPrograms?.find(
        (sp) => sp.reason === systematicProgramReason
    );
    const currentPayor = (systematicProgram?.parties || [])[0];
    const currentPayorParty = policy?.parties?.find(
        (party) => party.partyId === currentPayor?.partyId
    );
    const currentPayorBank = currentPayorParty?.bankDetails?.find(
        (bank) => bank.bankId === currentPayor?.bankId
    );
    const currentAddressPayor = (systematicProgram?.parties || [])[0];
    const currentPayorAddress = currentPayorParty?.addresses?.find(
        (address) => address.addressId == currentAddressPayor?.addressId
    );
    const isWithdrawalAutopay = parentPage === ParentPage.Withdrawals;

    const comparisonData = [
        {
            header: '',
            new: t(
                `allFields.${translationKeyPrefix}Summary${
                    systematicProgramTablesEnabled
                        ? 'NewSystematicProgramDetail'
                        : 'NewAutopayDetail'
                }`
            ),
            current: t(`${translationKeyPrefix}.summary.current`),
        },
        ...(isWithdrawalAutopay
            ? [
                  {
                      header: t(
                          `${translationKeyPrefix}.summary.distributionType`
                      ),
                      new:
                          arrangementType == ArrangementType.WITHDRAWAL
                              ? 'Withdrawal'
                              : 'RMD',
                      current:
                          systematicProgram?.arrangementType ==
                          ArrangementType.WITHDRAWAL
                              ? 'Withdrawal'
                              : 'RMD',
                  },
              ]
            : []),
        ...(isWithdrawalAutopay
            ? [
                  {
                      header: t(`${translationKeyPrefix}.summary.type`),
                      new: 'Dollar',
                      current: 'Dollar',
                  },
              ]
            : []),
        {
            header: t(`${translationKeyPrefix}.summary.amount`),
            new: numberFormatify(paymentAmount),
            current: numberFormatify(systematicProgram?.amount),
        },
        {
            header: t(`${translationKeyPrefix}.summary.frequency`),
            new: toTitleCase(getFrequency(frequency, t)),
            current: toTitleCase(
                getFrequency(systematicProgram?.frequency as Frequency, t)
            ),
        },
        {
            header: t(`${translationKeyPrefix}.summary.nextPaymentDate`),
            new: dayjs(effectiveDate, NUMERIC_DATE_FORMAT).format(
                DEFAULT_EXTENDED_DATE_FORMAT
            ),
            current: dayjs(
                systematicProgram?.nextProgramDate,
                'YYYY-MM-DD'
            ).format(DEFAULT_EXTENDED_DATE_FORMAT),
        },
        {
            header: t(`${translationKeyPrefix}.summary.fundAllocation`),
            new: 'Pro rata',
            current: 'Pro rata',
        },
        {
            header: t(`${translationKeyPrefix}.summary.payor`),
            new: payorFullName || payeeFullName,
            current: buildFullNameFromParty(currentPayorParty),
        },
        ...(isWithdrawalAutopay
            ? [
                  {
                      header: t(`${translationKeyPrefix}.summary.fbo`),
                      new: fboFfc ?? 'N/A',
                      current:
                          systematicProgram?.parties?.[0]
                              ?.forBenefitOfOrForFurtherCredit ?? 'N/A',
                  },
              ]
            : []),
        {
            // TODO MG: fix the comparison table so this can be translated
            // comparison table uses 'Banking details' to style
            header: 'Payment method',
            new: {
                paymentType: paymentForm,
                branchName: paymentBranchName,
                accountNumber: paymentAccountNumber,
                paymentAddress: paymentAddress ?? {},
            },
            current: {
                paymentType: systematicProgram?.paymentForm,
                branchName: currentPayorBank?.branchName,
                accountNumber: currentPayorBank?.accountNumber,
                paymentAddress: currentPayorAddress ?? {},
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
            <Typography variant={TypographyVariant.H1}>
                {t(`${translationKeyPrefix}.summary.label`)}
            </Typography>
            <Typography className="mb-6 mt-2" variant={TypographyVariant.Body}>
                {validationSucceeded
                    ? t(`${translationKeyPrefix}.summary.status200subtitle`)
                    : t(`${translationKeyPrefix}.summary.status400subtitle`)}
            </Typography>
            <div>
                <div className="overflow-x-scroll">
                    <ComparisonTable comparisonData={comparisonData} />
                </div>

                {!validationSucceeded && (
                    <div className="mt-10 flex flex-col gap-2">
                        {bannerResults?.map(
                            (result: ValidationResult, index: number) => (
                                <BannerAlert
                                    key={index}
                                    variant={BannerVariant.Error}
                                    canDismiss={false}
                                >
                                    {result.error} {result.resolution}
                                </BannerAlert>
                            )
                        )}
                        <div className="mt-6 flex flex-row">
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
                        validationSucceeded
                            ? t(
                                  `allFields.${translationKeyPrefix}Summary${
                                      systematicProgramTablesEnabled
                                          ? 'UpdateSystematicProgram'
                                          : 'UpdateAutopay'
                                  }`
                              ) ?? ''
                            : t(`${translationKeyPrefix}.summary.submit`) ?? ''
                    }
                    trackEventProps={{
                        type: transactionType,
                        step: TransactionStep.Summary,
                    }}
                />
            </div>
        </div>
    );
};

export default ManageSummary;
