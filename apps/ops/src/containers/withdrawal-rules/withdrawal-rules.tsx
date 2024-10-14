import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';

import Footnote from '@deps/components/footnote/footnote';
import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { Policy } from '@deps/models/policy/sor-policy';
import { ReactComponent as CurrencyDollarsIcon } from '@deps/styles/elements/icons/icons_outlined/currency-dollar.svg';
import { DEFAULT_DATE_FORMAT } from '@deps/types/constants';

export type WithdrawalRulesProps = {
    policy: Policy;
};

export default function WithdrawalRules({ policy }: WithdrawalRulesProps) {
    const { t } = useTranslation();

    const vestingDate = policy.allocation && dayjs(policy.allocation.matchSegment?.matchVestingDate).format(DEFAULT_DATE_FORMAT);
    const vestingDateString =
        vestingDate && dayjs(vestingDate).isAfter(dayjs().format(DEFAULT_DATE_FORMAT))
            ? t('withdrawals.rules.maxAnnualFuture', {
                  maxDuring: policy.withdrawalValues?.maximumWithdrawalRequestDuringVestingPeriod,
                  date: vestingDate,
                  maxAfter: policy.withdrawalValues?.maximumWithdrawalRequestAfterVestingPeriod,
              })
            : t('withdrawals.rules.maxAnnualPast', {
                  maxDuring: policy.withdrawalValues?.maximumWithdrawalRequestDuringVestingPeriod,
              });

    return (
        <CardContainer classNames="flex w-full flex-col items-start" containerClassNames="rounded-b">
            <div className="flex w-full flex-col">
                <div className="mb-4 flex flex-row items-center">
                    <CurrencyDollarsIcon width={24} height={24} className="mr-2 text-primary" role="presentation" />
                    <Typography variant={TypographyVariant.H2} className="mr-5">
                        {t('withdrawals.rules.title')}
                    </Typography>
                </div>

                <div className="ml-8 flex flex-col gap-8 xl:flex-row">
                    <div className="flex flex-col gap-8 md:flex-row">
                        <div className="flex w-[208px] flex-col items-start xl:w-fit">
                            <Label
                                variant={LabelVariant.FieldLabel}
                                tooltipTitle={t('withdrawals.rules.minWithdrawal')}
                                tooltipBody={t('withdrawals.rules.minWithdrawalTooltip')}
                                label={t('withdrawals.rules.minWithdrawal')}
                            />
                            <Typography variant={TypographyVariant.BodySm} className="mt-[5px]">
                                {numberFormatify(policy.withdrawalValues?.minimumWithdrawalAmount, {
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
                                {numberFormatify(policy.withdrawalValues?.maximumWithdrawalAmount, {
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
                                {vestingDateString}
                            </Typography>
                        </div>
                        <div className="flex w-[208px] flex-col items-start xl:w-fit">
                            <Label
                                aria-labelledby={`${t('withdrawals.rules.coverageLimit')} footnote`}
                                variant={LabelVariant.FieldLabel}
                                tooltipTitle={t('withdrawals.rules.coverageLimit')}
                                tooltipBody={t('withdrawals.rules.coverageLimitTooltip')}
                                label={t('withdrawals.rules.coverageLimit') + '*'}
                            />
                            <Typography variant={TypographyVariant.BodySm} className="mt-[5px]">
                                {numberFormatify(policy.withdrawalValues?.annualWithdrawalLimitNoCoverageDecrease, {
                                    style: 'currency',
                                    currency: 'USD',
                                })}
                            </Typography>
                        </div>
                    </div>
                </div>
                <Footnote productMarketingName={policy.product?.marketingName} productType={policy.product?.productType} />
            </div>
        </CardContainer>
    );
}
