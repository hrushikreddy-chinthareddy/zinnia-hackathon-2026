import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import BadgeWithTooltip from '@deps/components/badge/badge-with-tooltip/badge-with-tooltip';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import TempNavInactive from '@deps/components/nav-element/temp-nav-inactive/temp-nav-inactive';
import { PageHeader } from '@deps/components/page-header/page-header';
import { PopoverPlacement } from '@deps/components/popover/popover';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { formatValidationResult } from '@deps/helpers/bpm-transaction.helpers';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { mapWithdrawalsSubPage } from '@deps/helpers/withdrawals.helpers';
import { useTransactionPermissionCheck } from '@deps/hooks/useTransactionPermissionCheck';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import {
    checkFullSurrenderWithdrawal,
    checkPartialWithdrawalOneTimeEligibilityQuery,
} from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { TransactionPermission } from '@deps/utils/auth';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { Policy as SorPolicy } from '@zinnia/api-types/types/sor';

interface WithdrawalsPageHeaderContainerProps {
    isNavDrawerOpen?: boolean;
    planCode?: string;
    policyNumber?: string;
}

const WithdrawalsPageHeaderContainer = ({
    planCode,
    policyNumber,
}: WithdrawalsPageHeaderContainerProps) => {
    const { t } = useTranslation();
    const { policyDetails } = useContext(PolicyData);
    const { featureFlags } = useOptimizely();

    const freeLookEnabled =
        featureFlags[FEATURE_FLAGS.POLICY_FREE_LOOK_CANCELLATION];

    const {
        data: partialWithdrawalOneTimeEligibility,
        isLoading: isLoadingPartialWithdrawalOneTimeEligibility,
    } = useQuery({
        queryKey: [
            'checkPartialWithdrawalOneTimeEligibility',
            policyDetails.planCode,
            policyDetails.policyNumber,
        ],
        queryFn: () =>
            checkPartialWithdrawalOneTimeEligibilityQuery(
                policyDetails.planCode as string,
                policyDetails.policyNumber as string
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligiblePartialWithdrawalOneTime:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { isPermissioned: isUserPermissionedToWithdraw } =
        useTransactionPermissionCheck(
            TransactionPermission.WritePolicy,
            policyNumber,
            planCode
        );

    const withdrawalsValues = mapWithdrawalsSubPage({
        isEligible:
            partialWithdrawalOneTimeEligibility?.isEligiblePartialWithdrawalOneTime ||
            false,
        policy: policyDetails.policy as SorPolicy,
    });

    const status = policyDetails?.policyStatus?.toLocaleLowerCase();

    const {
        amountEligibleForWithdrawal,
        netSurrenderValue,
        freeWithdrawalAmount,
        annualWithdrawalsRemaining,
        annualWithdrawalsTaken,
        allTimeWithdrawalAmount,
        marketValueAdjustmentAmount,
        marketValueAdjustmentIndicator,
        allTimeWithdrawalCount,
        yearToDateFreeWithdrawalAmount,
        totalYearToDateWithdrawalTaken,
    } = withdrawalsValues ?? {};

    const { data: fullSurrenderEligibility } = useQuery({
        queryKey: [
            'checkFullSurrenderEligibility',
            policyDetails.planCode,
            policyDetails.policyNumber,
        ],
        queryFn: () =>
            checkFullSurrenderWithdrawal(
                policyDetails.planCode as string,
                policyDetails.policyNumber as string
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleFullSurrender:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const headerRowFlexClassNames = clsx('flex-col', 'xs:gap-4 lg:gap-0');
    const groupOneFlexClassNames = 'flex gap-4';

    const headerTextSiblingsGroupOne =
        !isLoadingPartialWithdrawalOneTimeEligibility && (
            <BadgeWithTooltip
                className="mb-2 mt-2 self-center"
                label={
                    partialWithdrawalOneTimeEligibility?.isEligiblePartialWithdrawalOneTime
                        ? t('withdrawals.eligible')
                        : t('withdrawals.ineligible')
                }
                tooltip={
                    partialWithdrawalOneTimeEligibility?.isEligiblePartialWithdrawalOneTime
                        ? t('withdrawals.eligibleForWithdrawalTooltip')
                        : formatValidationResult(
                              partialWithdrawalOneTimeEligibility?.validationResult
                          )
                }
                tooltipPlacement={PopoverPlacement.BottomRight}
                variant={
                    partialWithdrawalOneTimeEligibility?.isEligiblePartialWithdrawalOneTime
                        ? BadgeVariant.Positive
                        : BadgeVariant.Negative
                }
            />
        );

    const isPlural = allTimeWithdrawalCount !== 1;
    const withdrawalText = t(
        `withdrawals.withdrawal${isPlural ? 's' : ''}`
    ).toLowerCase();

    const hasWithdrawalCount =
        allTimeWithdrawalCount != null || allTimeWithdrawalCount !== undefined;
    const withdrawalCaption = hasWithdrawalCount
        ? `${allTimeWithdrawalCount} ${withdrawalText}`
        : DEFAULT_ERROR_STRING;

    const isAnnuity = policyDetails?.isAnnuity ?? false;
    const ytdFreeWithdrawalFormatted = isAnnuity
        ? numberFormatify(yearToDateFreeWithdrawalAmount as number)
        : '';
    const ytdFreeWithdrawalCaption = isAnnuity
        ? `${t(
              'withdrawals.ytdFreeWithdrawalAmount'
          )}: ${ytdFreeWithdrawalFormatted}`
        : '';
    const ytdWithdrawalsForAnnuity = isAnnuity
        ? `${t('withdrawals.ytdWithdrawals')}: ${numberFormatify(
              totalYearToDateWithdrawalTaken as number
          )}`
        : '';

    const belowHeaderTextChildren = (
        <>
            <div className="mt-4 w-fit">
                <div className="flex flex-col gap-8 xl:flex-row">
                    <div className="flex flex-col gap-8 md:flex-row">
                        {partialWithdrawalOneTimeEligibility?.isEligiblePartialWithdrawalOneTime && (
                            <div className="w-[224px] xl:w-fit">
                                <Label
                                    label={t(
                                        'withdrawals.eligibleForWithdrawal'
                                    )}
                                    tooltipTitle={t(
                                        'withdrawals.eligibleForWithdrawal'
                                    )}
                                    tooltipBody={t(
                                        'withdrawals.eligibleForWithdrawalTooltip'
                                    )}
                                    variant={LabelVariant.FieldLabel}
                                />
                                <Content
                                    details={
                                        numberFormatify(
                                            amountEligibleForWithdrawal as number
                                        ) || DEFAULT_ERROR_STRING
                                    }
                                    variant={ContentVariant.Value}
                                />
                            </div>
                        )}
                        <div className="w-[224px] xl:w-fit">
                            <Label
                                label={
                                    policyDetails?.isAnnuity
                                        ? t('withdrawals.surrenderValue')
                                        : t('withdrawals.netSurrenderValue')
                                }
                                tooltipTitle={t(
                                    'withdrawals.netSurrenderValue'
                                )}
                                tooltipBody={t(
                                    'withdrawals.netSurrenderValueTooltip'
                                )}
                                variant={LabelVariant.FieldLabel}
                            />
                            <Content
                                details={
                                    numberFormatify(
                                        netSurrenderValue as number
                                    ) || DEFAULT_ERROR_STRING
                                }
                                variant={ContentVariant.Value}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-8 md:flex-row">
                        <div className="w-[224px] xl:w-fit">
                            {policyDetails.isAnnuity ? (
                                <>
                                    <Label
                                        label={t(
                                            'withdrawals.freeWithdrawalRemaining'
                                        )}
                                        variant={LabelVariant.FieldLabel}
                                    />
                                    <Content
                                        details={
                                            numberFormatify(
                                                freeWithdrawalAmount as number
                                            ) || DEFAULT_ERROR_STRING
                                        }
                                        variant={ContentVariant.Value}
                                    />
                                    <Content
                                        className="text-gray-600"
                                        details={ytdFreeWithdrawalCaption}
                                        variant={ContentVariant.Caption}
                                    />
                                </>
                            ) : (
                                <>
                                    <Label
                                        label={t(
                                            'withdrawals.annualWithdrawalsRemaining'
                                        )}
                                        tooltipTitle={t(
                                            'withdrawals.annualWithdrawalsRemaining'
                                        )}
                                        tooltipBody={t(
                                            'withdrawals.annualWithdrawalsRemainingTooltip'
                                        )}
                                        variant={LabelVariant.FieldLabel}
                                    />
                                    <Content
                                        details={
                                            annualWithdrawalsTaken != null
                                                ? `${annualWithdrawalsRemaining} ${t(
                                                      'withdrawals.left'
                                                  )}`
                                                : DEFAULT_ERROR_STRING
                                        }
                                        variant={ContentVariant.Value}
                                    />
                                    <Content
                                        className="text-gray-600"
                                        details={
                                            annualWithdrawalsTaken != null
                                                ? `${annualWithdrawalsTaken} ${t(
                                                      'withdrawals.taken'
                                                  )}`
                                                : DEFAULT_ERROR_STRING
                                        }
                                        variant={ContentVariant.Caption}
                                    />
                                </>
                            )}
                        </div>
                        <div className="w-[224px] xl:w-fit">
                            <Label
                                label={
                                    policyDetails?.isAnnuity
                                        ? t('withdrawals.cumulativeWithdrawals')
                                        : t('withdrawals.allTimeWithdrawals')
                                }
                                tooltipTitle={t(
                                    'withdrawals.allTimeWithdrawals'
                                )}
                                tooltipBody={t(
                                    'withdrawals.allTimeWithdrawalsTooltip'
                                )}
                                variant={LabelVariant.FieldLabel}
                            />
                            <Content
                                details={
                                    numberFormatify(
                                        allTimeWithdrawalAmount as number
                                    ) || DEFAULT_ERROR_STRING
                                }
                                variant={ContentVariant.Value}
                            />
                            <Content
                                className="text-gray-600"
                                details={
                                    policyDetails?.isAnnuity
                                        ? ytdWithdrawalsForAnnuity
                                        : withdrawalCaption
                                }
                                variant={ContentVariant.Caption}
                            />
                        </div>

                        {policyDetails.isAnnuity && (
                            <div className="w-[224px] xl:w-fit">
                                <Label
                                    label={t('withdrawals.mvaApplies')}
                                    tooltipTitle={t('withdrawals.mvaApplies')}
                                    tooltipBody={t('withdrawals.mvaApplies')}
                                    variant={LabelVariant.FieldLabel}
                                />
                                <Content
                                    details={
                                        marketValueAdjustmentIndicator
                                            ? (t('yes') as string)
                                            : (t('no') as string)
                                    }
                                    variant={ContentVariant.Value}
                                />
                                <Content
                                    className="text-gray-600"
                                    details={`${t(
                                        'withdrawals.mvaAppliesMetadata'
                                    )}: ${numberFormatify(
                                        marketValueAdjustmentAmount
                                    )}`}
                                    variant={ContentVariant.Caption}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-4 flex w-full flex-row items-center gap-8 bg-gray-50 px-8 py-4 align-middle">
                {partialWithdrawalOneTimeEligibility?.isEligiblePartialWithdrawalOneTime &&
                isUserPermissionedToWithdraw ? (
                    <NavElement
                        href={
                            t(
                                'site.navLinks.transactions.withdrawalStart.href',
                                { id: policyNumber, planCode }
                            ) || ''
                        }
                        size={NavElementSize.Small}
                        type={NavElementType.Link}
                        data-testid="withdrawal-start-link"
                    >
                        {policyDetails.isAnnuity
                            ? t(
                                  'site.navLinks.transactions.withdrawalOneTime.text'
                              )
                            : t(
                                  'site.navLinks.transactions.withdrawalStart.text'
                              )}
                    </NavElement>
                ) : (
                    <TempNavInactive
                        tooltipBody={
                            partialWithdrawalOneTimeEligibility?.isEligiblePartialWithdrawalOneTime
                                ? t(
                                      'withdrawals.rules.permissionDeniedTooltip',
                                      {
                                          carrier: policyDetails.carrierName,
                                      }
                                  )
                                : t('withdrawals.rules.statusTooltip', {
                                      status: status,
                                  })
                        }
                        navElementClassName="!px-2"
                    >
                        {policyDetails.isAnnuity
                            ? t(
                                  'site.navLinks.transactions.withdrawalOneTime.text'
                              )
                            : t(
                                  'site.navLinks.transactions.withdrawalStart.text'
                              )}
                    </TempNavInactive>
                )}
                {fullSurrenderEligibility?.isEligibleFullSurrender &&
                isUserPermissionedToWithdraw ? (
                    <NavElement
                        href={
                            t(
                                'site.navLinks.transactions.withdrawalStart.href',
                                {
                                    id: policyNumber,
                                    planCode,
                                }
                            ) || ''
                        }
                        size={NavElementSize.Small}
                        type={NavElementType.Link}
                        data-testid="surrender-policy-link"
                    >
                        {t('withdrawals.surrenderPolicy')}
                    </NavElement>
                ) : (
                    <TempNavInactive
                        tooltipBody={
                            fullSurrenderEligibility?.isEligibleFullSurrender
                                ? t(
                                      'withdrawals.rules.permissionDeniedTooltip',
                                      {
                                          carrier: policyDetails.carrierName,
                                      }
                                  )
                                : t('withdrawals.rules.statusTooltip', {
                                      status: status,
                                  })
                        }
                        navElementClassName="!px-2"
                    >
                        {t('withdrawals.surrenderPolicy')}
                    </TempNavInactive>
                )}
                {freeLookEnabled &&
                policyDetails.freeLookPeriodDetails.isInFreeLookPeriod &&
                isUserPermissionedToWithdraw ? (
                    <NavElement
                        href={
                            t('site.navLinks.cancelFreeLook.href', {
                                id: policyNumber,
                                planCode,
                            }) || ''
                        }
                        size={NavElementSize.Small}
                        type={NavElementType.Link}
                        data-testid="cancel-free-look-link"
                    >
                        {t('withdrawals.freeLookCancel')}
                    </NavElement>
                ) : (
                    freeLookEnabled &&
                    policyDetails.freeLookPeriodDetails.isInFreeLookPeriod && (
                        <TempNavInactive
                            tooltipBody={t(
                                'withdrawals.rules.permissionDeniedTooltip',
                                {
                                    carrier: policyDetails.carrierName,
                                }
                            )}
                            navElementClassName="!px-2"
                        >
                            {t('withdrawals.freeLookCancel')}
                        </TempNavInactive>
                    )
                )}
            </div>
        </>
    );

    return (
        <PageHeader
            headerText={t('pageHeader.withdrawals.headerText') || ''}
            headerTextSiblingsGroupOne={headerTextSiblingsGroupOne}
            headerRowFlexClassNames={headerRowFlexClassNames}
            groupOneFlexClassNames={groupOneFlexClassNames}
            belowHeaderTextChildren={belowHeaderTextChildren}
        />
    );
};

export default WithdrawalsPageHeaderContainer;
