import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import BadgeWithTooltip from '@deps/components/badge/badge-with-tooltip/badge-with-tooltip';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import Label, { LabelVariant } from '@deps/components/label/label';
import { PopoverPlacement } from '@deps/components/popover/popover';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { DEFAULT_DATE_FORMAT } from '@deps/types/constants';
import { DEFAULT_ERROR_STRING , convertToCamelCase } from '@deps/utils/strings';
import { Policy } from '@zinnia/api-types/types/sor';

export type WithdrawalRulesProps = {
    policy: Policy;
    policyDetails: PolicyDetails;
};

export default function WithdrawalRules({ policy }: WithdrawalRulesProps) {
    const { t } = useTranslation();
    const { policyDetails } = useContext(PolicyData);
    const {
        maximumWithdrawalAmount,
        maximumWithdrawalRequestDuringVestingPeriod,
        maximumWithdrawalRequestAfterVestingPeriod,
        minimumWithdrawalAmount,
    } = policy.withdrawalValues || {};

    if (
        [
            maximumWithdrawalAmount,
            maximumWithdrawalRequestDuringVestingPeriod,
            maximumWithdrawalRequestAfterVestingPeriod,
            minimumWithdrawalAmount,
        ].every((x) => x === undefined)
    ) {
        return null;
    }

    const totalAnnualAmount =
        policyDetails.requiredMinimumDistribution.totalAnnualAmount;

    let badgeLabel: string;
    let badgeTooltipText: string;

    if (totalAnnualAmount && totalAnnualAmount > 0) {
        badgeLabel = t('withdrawals.required');
        badgeTooltipText = t('withdrawals.requiredRmdsTooltip');
    } else if (totalAnnualAmount === 0 || totalAnnualAmount === null) {
        badgeLabel = t('withdrawals.notRequired');
        badgeTooltipText = t('withdrawals.notRequiredRmdsTooltip');
    } else {
        badgeLabel = t('withdrawals.notAvailable');
        badgeTooltipText = '';
    }

    return (
        <CardContainer
            classNames="flex w-full flex-col items-start"
            containerClassNames="rounded-b"
        >
            <div className="flex w-full flex-col">
                <div className="flex items-center mb-4">
                    <Typography variant={TypographyVariant.H2} className="mr-5">
                        {policyDetails.isAnnuity
                            ? t('withdrawals.rmd.title')
                            : t('withdrawals.rules.title')}
                    </Typography>
                    {policyDetails.isAnnuity && (
                        <BadgeWithTooltip
                            className="mb-2 mt-2 self-center"
                            label={badgeLabel}
                            tooltip={badgeTooltipText}
                            tooltipPlacement={PopoverPlacement.BottomRight}
                            variant={BadgeVariant.Info}
                        />
                    )}
                </div>

                <div className="flex flex-col gap-8 xl:flex-row">
                    {policyDetails.isAnnuity ? (
                        <>
                            <div className="flex flex-col gap-8 md:flex-row">
                                <div className="flex w-[208px] flex-col items-start xl:w-fit">
                                    <Label
                                        sentenceCase={false}
                                        variant={LabelVariant.FieldLabel}
                                        tooltipTitle={t(
                                            'withdrawals.rmd.totalRMDAmount'
                                        )}
                                        tooltipBody={t(
                                            'withdrawals.rmd.totalRMDAmountTooltip'
                                        )}
                                        label={t(
                                            'withdrawals.rmd.totalRMDAmount'
                                        )}
                                    />
                                    <Typography
                                        variant={TypographyVariant.BodySm}
                                        className="mt-[5px]"
                                    >
                                        {numberFormatify(
                                            policyDetails
                                                .requiredMinimumDistribution
                                                .totalAnnualAmount,
                                            {
                                                style: 'currency',
                                                currency: 'USD',
                                            }
                                        )}
                                    </Typography>
                                </div>
                                <div className="flex w-[208px] flex-col items-start xl:w-fit">
                                    <Label
                                        sentenceCase={false}
                                        variant={LabelVariant.FieldLabel}
                                        tooltipTitle={t(
                                            'withdrawals.rmd.remainingRMDAmount'
                                        )}
                                        tooltipBody={t(
                                            'withdrawals.rmd.remainingRMDAmountTooltip'
                                        )}
                                        label={t(
                                            'withdrawals.rmd.remainingRMDAmount'
                                        )}
                                    />
                                    <Typography
                                        variant={TypographyVariant.BodySm}
                                        className="mt-[5px]"
                                    >
                                        {numberFormatify(
                                            policyDetails
                                                .requiredMinimumDistribution
                                                .remainingAmount,
                                            {
                                                style: 'currency',
                                                currency: 'USD',
                                            }
                                        )}
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex flex-col gap-8 md:flex-row">
                                <div className="flex w-[208px] flex-col items-start xl:w-fit">
                                    <Label
                                        variant={LabelVariant.FieldLabel}
                                        tooltipTitle={t(
                                            'withdrawals.rmd.calculationDate'
                                        )}
                                        tooltipBody={t(
                                            'withdrawals.rmd.calculationDateTooltip'
                                        )}
                                        label={t(
                                            'withdrawals.rmd.calculationDate'
                                        )}
                                    />
                                    <Typography
                                        variant={TypographyVariant.BodySm}
                                        className="mt-[5px]"
                                    >
                                        {policyDetails
                                            ?.requiredMinimumDistribution
                                            ?.calculationDate
                                            ? dayjs(
                                                  policyDetails
                                                      .requiredMinimumDistribution
                                                      .calculationDate
                                              ).format(DEFAULT_DATE_FORMAT)
                                            : DEFAULT_ERROR_STRING}
                                    </Typography>
                                </div>
                                <div className="flex w-[208px] flex-col items-start xl:w-fit">
                                    <Label
                                        variant={LabelVariant.FieldLabel}
                                        tooltipTitle={t(
                                            'withdrawals.rmd.calculationType'
                                        )}
                                        tooltipBody={t(
                                            'withdrawals.rmd.calculationTypeTooltip'
                                        )}
                                        label={t(
                                            'withdrawals.rmd.calculationType'
                                        )}
                                    />
                                    <Typography
                                        variant={TypographyVariant.BodySm}
                                        className="mt-[5px]"
                                    >
                                        {policyDetails
                                            .requiredMinimumDistribution
                                            .calculationOption
                                            ? t(
                                                  `withdrawals.${convertToCamelCase(
                                                      policyDetails
                                                          .requiredMinimumDistribution
                                                          .calculationOption
                                                  )}`
                                              )
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
                                        tooltipTitle={t(
                                            'withdrawals.rules.minWithdrawal'
                                        )}
                                        tooltipBody={t(
                                            'withdrawals.rules.minWithdrawalTooltip'
                                        )}
                                        label={t(
                                            'withdrawals.rules.minWithdrawal'
                                        )}
                                    />
                                    <Typography
                                        variant={TypographyVariant.BodySm}
                                        className="mt-[5px]"
                                    >
                                        {numberFormatify(
                                            minimumWithdrawalAmount,
                                            {
                                                style: 'currency',
                                                currency: 'USD',
                                            }
                                        )}
                                    </Typography>
                                </div>
                                <div className="flex w-[208px] flex-col items-start xl:w-fit">
                                    <Label
                                        variant={LabelVariant.FieldLabel}
                                        tooltipTitle={t(
                                            'withdrawals.rules.maxWithdrawal'
                                        )}
                                        tooltipBody={t(
                                            'withdrawals.rules.maxWithdrawalTooltip'
                                        )}
                                        label={t(
                                            'withdrawals.rules.maxWithdrawal'
                                        )}
                                    />
                                    <Typography
                                        variant={TypographyVariant.BodySm}
                                        className="mt-[5px]"
                                    >
                                        {numberFormatify(
                                            maximumWithdrawalAmount,
                                            {
                                                style: 'currency',
                                                currency: 'USD',
                                            }
                                        )}
                                    </Typography>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </CardContainer>
    );
}
