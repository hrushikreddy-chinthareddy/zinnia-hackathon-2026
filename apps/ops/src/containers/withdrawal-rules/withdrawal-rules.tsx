import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import Footnote from '@deps/components/footnote/footnote';
import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { formatDate } from '@deps/helpers/string.helper';
import { Policy } from '@deps/models/policy/sor-policy';
import { DEFAULT_DATE_FORMAT, DEFAULT_ERROR_STRING } from '@deps/types/constants';

export type WithdrawalRulesProps = {
    policy: Policy;
    policyDetails: PolicyDetails;
};

export default function WithdrawalRules({ policy }: WithdrawalRulesProps) {
    const { t } = useTranslation();
    const { policyDetails } = useContext(PolicyData);
    const {
        annualWithdrawalLimitNoCoverageDecrease,
        maximumWithdrawalAmount,
        maximumWithdrawalRequestDuringVestingPeriod,
        maximumWithdrawalRequestAfterVestingPeriod,
        minimumWithdrawalAmount,
    } = policy.withdrawalValues || {};

    if (
        [
            annualWithdrawalLimitNoCoverageDecrease,
            maximumWithdrawalAmount,
            maximumWithdrawalRequestDuringVestingPeriod,
            maximumWithdrawalRequestAfterVestingPeriod,
            minimumWithdrawalAmount,
        ].every(x => x === undefined)
    ) {
        return null;
    }

    let vestingDate = formatDate(policy?.allocation?.matchSegment?.matchVestingDate);

    if (vestingDate !== DEFAULT_ERROR_STRING) {
        vestingDate = dayjs(vestingDate).isAfter(dayjs().format(DEFAULT_DATE_FORMAT))
            ? t('withdrawals.rules.maxAnnualFuture', {
                  maxDuring: maximumWithdrawalRequestDuringVestingPeriod,
                  date: vestingDate,
                  maxAfter: maximumWithdrawalRequestAfterVestingPeriod,
              })
            : t('withdrawals.rules.maxAnnualPast', {
                  maxDuring: maximumWithdrawalRequestDuringVestingPeriod,
              });
    }

    return (
        <CardContainer classNames="flex w-full flex-col items-start" containerClassNames="rounded-b">
            <div className="flex w-full flex-col">
                <div className="mb-4">
                    <Typography variant={TypographyVariant.H2} className="mr-5">
                        {policyDetails.isAnnuity ? t('withdrawals.rmd.title') : t('withdrawals.rules.title')}
                    </Typography>
                </div>

                <div className="flex flex-col gap-8 xl:flex-row">
                    {policyDetails.isAnnuity ? (
                        <>
                            <div className="flex flex-col gap-8 md:flex-row">
                                <div className="flex w-[208px] flex-col items-start xl:w-fit">
                                    <Label
                                        sentenceCase={false}
                                        variant={LabelVariant.FieldLabel}
                                        tooltipTitle={t('withdrawals.rmd.totalRMDAmount')}
                                        tooltipBody={t('withdrawals.rmd.totalRMDAmountTooltip')}
                                        label={t('withdrawals.rmd.totalRMDAmount')}
                                    />
                                    <Typography variant={TypographyVariant.BodySm} className="mt-[5px]">
                                        {numberFormatify(policyDetails.requiredMinimumDistribution.totalAnnualAmount, {
                                            style: 'currency',
                                            currency: 'USD',
                                        })}
                                    </Typography>
                                </div>
                                <div className="flex w-[208px] flex-col items-start xl:w-fit">
                                    <Label
                                        sentenceCase={false}
                                        variant={LabelVariant.FieldLabel}
                                        tooltipTitle={t('withdrawals.rmd.remainingRMDAmount')}
                                        tooltipBody={t('withdrawals.rmd.remainingRMDAmountTooltip')}
                                        label={t('withdrawals.rmd.remainingRMDAmount')}
                                    />
                                    <Typography variant={TypographyVariant.BodySm} className="mt-[5px]">
                                        {numberFormatify(policyDetails.requiredMinimumDistribution.remainingAmount, {
                                            style: 'currency',
                                            currency: 'USD',
                                        })}
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex flex-col gap-8 md:flex-row">
                                <div className="flex w-[208px] flex-col items-start">
                                    <Label
                                        variant={LabelVariant.FieldLabel}
                                        tooltipTitle={t('withdrawals.rmd.calculationDate')}
                                        tooltipBody={t('withdrawals.rmd.calculationDateTooltip')}
                                        label={t('withdrawals.rmd.calculationDate')}
                                    />
                                    <Typography variant={TypographyVariant.BodySm} className="mt-[5px]">
                                        {policyDetails?.requiredMinimumDistribution?.calculationDate
                                            ? dayjs(policyDetails.requiredMinimumDistribution.calculationDate).format(DEFAULT_DATE_FORMAT)
                                            : DEFAULT_ERROR_STRING}
                                    </Typography>
                                </div>
                                <div className="flex w-[208px] flex-col items-start xl:w-fit">
                                    <Label
                                        variant={LabelVariant.FieldLabel}
                                        tooltipTitle={t('withdrawals.rmd.calculationType')}
                                        tooltipBody={t('withdrawals.rmd.calculationTypeTooltip')}
                                        label={t('withdrawals.rmd.calculationType')}
                                    />
                                    <Typography variant={TypographyVariant.BodySm} className="mt-[5px]">
                                        {policyDetails.requiredMinimumDistribution.calculationOption
                                            ? `${policyDetails.requiredMinimumDistribution.calculationOption}`
                                            : DEFAULT_ERROR_STRING}
                                    </Typography>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col gap-8 md:flex-row">
                                <div className="flex w-[208px] flex-col items-start xl:w-fit">
                                    <Label
                                        variant={LabelVariant.FieldLabel}
                                        tooltipTitle={t('withdrawals.rules.minWithdrawal')}
                                        tooltipBody={t('withdrawals.rules.minWithdrawalTooltip')}
                                        label={t('withdrawals.rules.minWithdrawal')}
                                    />
                                    <Typography variant={TypographyVariant.BodySm} className="mt-[5px]">
                                        {numberFormatify(minimumWithdrawalAmount, {
                                            style: 'currency',
                                            currency: 'USD',
                                        })}
                                    </Typography>
                                </div>
                                <div className="flex w-[208px] flex-col items-start xl:w-fit">
                                    <Label
                                        variant={LabelVariant.FieldLabel}
                                        tooltipTitle={t('withdrawals.rules.maxWithdrawal')}
                                        tooltipBody={t('withdrawals.rules.maxWithdrawalTooltip')}
                                        label={t('withdrawals.rules.maxWithdrawal')}
                                    />
                                    <Typography variant={TypographyVariant.BodySm} className="mt-[5px]">
                                        {numberFormatify(maximumWithdrawalAmount, {
                                            style: 'currency',
                                            currency: 'USD',
                                        })}
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex flex-col gap-8 md:flex-row">
                                <div className="flex w-[208px] flex-col items-start">
                                    <Label
                                        aria-labelledby={`${t('withdrawals.rules.maxAnnual')} footnote`}
                                        variant={LabelVariant.FieldLabel}
                                        tooltipTitle={t('withdrawals.rules.maxAnnual')}
                                        tooltipBody={t('withdrawals.rules.maxAnnualTooltip')}
                                        label={t('withdrawals.rules.maxAnnual') + '*'}
                                    />
                                    <Typography variant={TypographyVariant.BodySm} className="mt-[5px]">
                                        {vestingDate}
                                    </Typography>
                                </div>
                                <div className="flex w-[208px] flex-col items-start xl:w-fit">
                                    <Label
                                        aria-labelledby={`$t('withdrawals.rules.coverageLimit')} footnote`}
                                        variant={LabelVariant.FieldLabel}
                                        tooltipTitle={t('withdrawals.rules.coverageLimit')}
                                        tooltipBody={t('withdrawals.rules.coverageLimitTooltip')}
                                        label={t('withdrawals.rules.coverageLimit') + '*'}
                                    />
                                    <Typography variant={TypographyVariant.BodySm} className="mt-[5px]">
                                        {numberFormatify(annualWithdrawalLimitNoCoverageDecrease, {
                                            style: 'currency',
                                            currency: 'USD',
                                        })}
                                    </Typography>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                {!policyDetails.isAnnuity && (
                    <Footnote productMarketingName={policy.product?.marketingName} productType={policy.product?.productType} />
                )}
            </div>
        </CardContainer>
    );
}
