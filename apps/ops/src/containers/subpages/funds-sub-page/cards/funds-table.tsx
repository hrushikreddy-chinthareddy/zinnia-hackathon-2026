import {
    Table,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableBody,
    TableCell,
    Icon,
    IconType,
    Loader,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { CSSProperties, useMemo, useState } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import { FindAllKeyValuesFundSidesheet } from '@deps/components/find-key-values-sidesheet/find-all-key-values-fund-sidesheet';
import Popover, { PopoverPlacement } from '@deps/components/popover/popover';
import { TranslationFiles } from '@deps/config/translations';
import { getBeneficiaryColor } from '@deps/containers/people-card-container/people-card-container.helpers';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import {
    isNullEmptyOrUndefined,
    toSentenceCase,
} from '@deps/helpers/string.helpers';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';

import styles from './funds-table.module.css';
import { FundViewModel } from '../types';
import IndexVariableFundSideSheet from './index-variable-fund-side-sheet';

interface FundsTableProps {
    funds?: FundViewModel[];
    loading?: boolean;
    policy: PolicyDetails;
    /**
     * Optional accessible caption describing the specific fund table
     * (e.g., elected vs non-elected funds).
     */
    caption?: string;
    /**
     * Whether the funds are elected or not.
     */
    isElected?: boolean;
}

export enum FundTypes {
    Index = 'Index',
    Variable = 'Variable',
    Fixed = 'Fixed',
}

const hasSideSheet = (fundType: string | undefined) =>
    fundType === FundTypes.Index || fundType === FundTypes.Variable;

const FundsTable = ({
    funds,
    loading,
    policy,
    caption,
    isElected = false,
}: FundsTableProps) => {
    const sideSheet = useSideSheetContextLegacy();
    const { featureFlags } = useOptimizely();
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.funds.fundsTable',
    });

    // Feature flag for revised fund sidesheets
    const isRevisedFundSidesheetEnabled =
        featureFlags[FEATURE_FLAGS.FKV_REVISED_FUND_SIDESHEETS] ?? false;

    // State for the new FKV fund sidesheet
    const [fkvSidesheetOpen, setFkvSidesheetOpen] = useState(false);
    const [selectedFund, setSelectedFund] = useState<FundViewModel | null>(
        null
    );

    /* New FKV Fund Sidesheet - combine fund and fundAllocationsInvestment */
    const combinedFund = useMemo(() => {
        if (!isRevisedFundSidesheetEnabled || !selectedFund) {
            return undefined;
        }

        const policyFunds = policy.policy?.allocation?.funds ?? [];
        const policyFund = policyFunds.find(
            (f) => f.fundId === selectedFund.fundId
        );

        const fundAllocationsInvestments =
            policy.policy?.allocation?.fundAllocationsInvestments ?? [];
        const fundAllocationsInvestment = fundAllocationsInvestments.find(
            (f) => f.fundId === selectedFund.fundId
        );

        const fundDetails = funds?.find(
            (f) => f.fundId === selectedFund.fundId
        );
        console.log('.....', fundDetails);
        // Returned combined fund data
        return {
            ...policyFund,
            ...fundAllocationsInvestment,
            glCode: fundDetails?.glCode,
            minimumTransferAmount: fundDetails?.minimumTransferAmount,
            rateEffectiveDate: fundDetails?.rateEffectiveDate,
            sweepToFundId: fundDetails?.sweepToFundId,
            bonusPeriodFrequency: fundDetails?.bonusPeriodFrequency,
            interestRate: fundDetails?.interestRate,
            maximumIllustrativeInterestRate:
                fundDetails?.maximumIllustrativeInterestRate,
        };
    }, [isRevisedFundSidesheetEnabled, selectedFund, policy, funds]);

    if (!loading && !funds?.length) {
        return (
            <div className={styles.noFundsContainer}>
                <Icon type={IconType.CIRCLE_INFO} height={16} width={16} />
                <Content
                    details={t('noFunds') as string}
                    variant={ContentVariant.CaptionSelected}
                />
            </div>
        );
    }

    const hasSomeAllocation = funds?.some(
        (fund) => fund.allocation !== DEFAULT_ERROR_STRING
    );
    const hasSomeSweepDate = funds?.some(
        (fund) => fund.nextSweepDate !== DEFAULT_ERROR_STRING
    );
    const hasGuaranteePeriod = policy.isAnnuity;

    const renderGuaranteePeriod = (fund: FundViewModel) => {
        if (!hasGuaranteePeriod) {
            return null;
        }

        // NOTE!!!
        // Per Amanda Boyer, the guarnatee period is *almost* always in years
        // There's a backlog item to provide interestGuaranteePeriodMode to provide support for 2 obscure funds that are in quarters
        // This will be fine per Maureen until we revisit at that point.
        const guaranteePeriodContent = isNullEmptyOrUndefined(
            fund.interestGuaranteedPeriod
        )
            ? DEFAULT_ERROR_STRING
            : t('years', { count: fund.interestGuaranteedPeriod });

        return (
            <TableCell className={styles.typeCell}>
                <Content
                    details={guaranteePeriodContent}
                    variant={ContentVariant.BodySm}
                />
            </TableCell>
        );
    };

    /**
     * Opens the legacy sidesheet for Index/Variable funds.
     */
    const openLegacySideBar = (fund: FundViewModel) => {
        sideSheet.changeSideSheetContent(
            t('sheetDetail') as string,
            <IndexVariableFundSideSheet fund={fund} policy={policy} />
        );
        sideSheet.handleOpen(true);
    };

    /**
     * Opens the new FKV sidesheet for all fund types.
     * Used when fkv_revised_fund_sidesheets feature flag is enabled.
     */
    const openFkvSideSheet = (fund: FundViewModel) => {
        setSelectedFund(fund);
        setFkvSidesheetOpen(true);
    };

    /**
     * Handles fund row click based on feature flag state.
     */
    const handleFundClick = (fund: FundViewModel) => {
        if (isRevisedFundSidesheetEnabled) {
            openFkvSideSheet(fund);
        } else if (hasSideSheet(fund.type)) {
            openLegacySideBar(fund);
        }
    };

    const captionId = caption
        ? caption.includes('Elected')
            ? 'elected-funds-table-description'
            : 'not-elected-funds-table-description'
        : undefined;

    return (
        <>
            <Table aria-describedby={captionId}>
                {caption && (
                    <caption id={captionId} className="sr-only">
                        {caption}
                    </caption>
                )}
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell className={styles.nameCell}>
                            <Content
                                details={t('fundName') as string}
                                variant={ContentVariant.BodySmBold}
                            />
                        </TableHeaderCell>
                        <TableHeaderCell className={styles.typeCell}>
                            <Content
                                details={t('type') as string}
                                variant={ContentVariant.BodySmBold}
                            />
                        </TableHeaderCell>
                        {hasGuaranteePeriod && (
                            <TableHeaderCell
                                className={styles.guaranteePeriodCell}
                            >
                                <Content
                                    details={t('guaranteePeriod') as string}
                                    variant={ContentVariant.BodySmBold}
                                />
                            </TableHeaderCell>
                        )}
                        <TableHeaderCell className={styles.valueCell}>
                            <Content
                                details={t('fundValue') as string}
                                variant={ContentVariant.BodySmBold}
                            />
                        </TableHeaderCell>
                        {hasSomeAllocation && (
                            <TableHeaderCell>
                                <Content
                                    details={t('allocation') as string}
                                    variant={ContentVariant.BodySmBold}
                                />
                            </TableHeaderCell>
                        )}
                        {hasSomeSweepDate && (
                            <TableHeaderCell>
                                <div className={styles.tableHeaderContainer}>
                                    <Content
                                        details={t('nextSweepDate') as string}
                                        variant={ContentVariant.BodySmBold}
                                    />
                                    <Popover
                                        title={toSentenceCase(
                                            t('nextSweepDate') as string
                                        )}
                                        body={
                                            t('nextSweepDateTooltip') as string
                                        }
                                        placement={PopoverPlacement.TopRight}
                                    >
                                        <Icon
                                            type={IconType.CIRCLE_INFO}
                                            color="var(--color-base-icon-action-text-link)"
                                            height={16}
                                            width={16}
                                        />
                                    </Popover>
                                </div>
                            </TableHeaderCell>
                        )}
                        {!hasSomeAllocation && !hasSomeSweepDate && (
                            <TableHeaderCell>
                                <></>
                            </TableHeaderCell>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5}>
                                <div className={styles.loaderContainer}>
                                    <span
                                        className={styles.loaderIconContainer}
                                        style={
                                            {
                                                '--loader-size': '33px',
                                            } as CSSProperties
                                        }
                                    >
                                        <Loader />
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        funds?.map((fund, index) => {
                            return (
                                <TableRow
                                    key={`fund-${fund.fundId}-${index}`}
                                    className={
                                        isRevisedFundSidesheetEnabled &&
                                        isElected
                                            ? styles.clickableRow
                                            : ''
                                    }
                                    onClick={
                                        isRevisedFundSidesheetEnabled &&
                                        isElected
                                            ? () => handleFundClick(fund)
                                            : undefined
                                    }
                                >
                                    {/* Fund name cell - conditionally styled based on feature flag */}
                                    {isRevisedFundSidesheetEnabled ? (
                                        // New behavior: plain text, entire row is clickable
                                        <TableCell className={styles.nameCell}>
                                            <Content
                                                details={fund.fundName}
                                                variant={ContentVariant.BodySm}
                                            />
                                        </TableCell>
                                    ) : hasSideSheet(fund.type) ? (
                                        // Legacy behavior: underlined link for Index/Variable funds
                                        <TableCell className={styles.nameCell}>
                                            <button
                                                onClick={() =>
                                                    openLegacySideBar(fund)
                                                }
                                                className="cursor-pointer text-[var(--color-base-text-link)] underline underline-offset-4 bg-transparent border-none p-0 text-left"
                                            >
                                                <Content
                                                    details={fund.fundName}
                                                    variant={
                                                        ContentVariant.BodySm
                                                    }
                                                />
                                            </button>
                                        </TableCell>
                                    ) : (
                                        // Legacy behavior: plain text for non-clickable funds
                                        <TableCell className={styles.nameCell}>
                                            <Content
                                                details={fund.fundName}
                                                variant={ContentVariant.BodySm}
                                            />
                                        </TableCell>
                                    )}

                                    <TableCell className={styles.typeCell}>
                                        <Content
                                            details={toSentenceCase(fund.type)}
                                            variant={ContentVariant.BodySm}
                                        />
                                    </TableCell>
                                    {hasGuaranteePeriod &&
                                        renderGuaranteePeriod(fund)}
                                    <TableCell className={styles.valueCell}>
                                        <Content
                                            details={fund.fundValue}
                                            variant={ContentVariant.BodySm}
                                        />
                                    </TableCell>
                                    {hasSomeAllocation && (
                                        <TableCell>
                                            <div
                                                className={
                                                    styles.allocationContainer
                                                }
                                            >
                                                <div
                                                    className={clsx(
                                                        styles.allocationSquare,
                                                        getBeneficiaryColor(
                                                            index
                                                        )
                                                    )}
                                                    role="presentation"
                                                ></div>
                                                <Content
                                                    details={fund.allocation}
                                                    variant={
                                                        ContentVariant.BodySm
                                                    }
                                                />
                                            </div>
                                        </TableCell>
                                    )}
                                    {hasSomeSweepDate && (
                                        <TableCell>
                                            <Content
                                                details={fund.nextSweepDate}
                                                variant={ContentVariant.BodySm}
                                            />
                                        </TableCell>
                                    )}
                                    {!hasSomeAllocation &&
                                        !hasSomeSweepDate && (
                                            <TableCell>
                                                <></>
                                            </TableCell>
                                        )}
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>

            {!!combinedFund && (
                <FindAllKeyValuesFundSidesheet
                    open={fkvSidesheetOpen}
                    onOpenChange={setFkvSidesheetOpen}
                    combinedFund={combinedFund}
                />
            )}
        </>
    );
};

export default FundsTable;
