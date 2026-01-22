import { Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import AllocationColorBar, {
    AllocationColor,
} from '@deps/components/allocation-color-bar/allocation-color-bar';
import FieldLabel from '@deps/components/fields/field-label';
import Popover, { PopoverPlacement } from '@deps/components/popover/popover';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { getBeneficiaryColor } from '@deps/containers/people-card-container/people-card-container.helpers';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { checkEligibilityFundAllocation } from '@deps/queries/api/fund-allocation';
import { ReactComponent as SettingsIcon } from '@deps/styles/elements/icons/icons_outlined/settings.svg';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';

import FundsTable from './funds-table';
import { FundViewModel } from '../types';
import { EditAllocationsContent } from './edit-allocations-side-sheet-content';

interface FundsCardProps {
    loading?: boolean;
    funds?: FundViewModel[];
    title?: string;
    titleTooltip?: string;
    policy: PolicyDetails;
    notElectedfunds?: FundViewModel[];
    /**
     * Optional accessible caption passed through to the underlying table.
     */
    caption?: string;
}

const getAllocationColors = (funds?: FundViewModel[]): AllocationColor[] => {
    const colors: AllocationColor[] = [];

    funds?.forEach((fund, index) => {
        const allocationValue =
            fund.allocation?.toString().replace(/%$/, '') || '0';
        if (!isNullEmptyOrUndefined(fund.allocation)) {
            colors.push({
                allocationPercentage: allocationValue,
                className: getBeneficiaryColor(index),
            });
        }
    });

    return colors;
};

const FundsCard = ({
    funds,
    loading,
    title,
    titleTooltip,
    policy,
    notElectedfunds,
    caption,
}: FundsCardProps) => {
    const { featureFlags } = useOptimizely();
    const { t } = useTranslation();
    const showAllocationBar = funds?.some(
        (fund) => fund.allocation !== DEFAULT_ERROR_STRING
    );
    const [isEligibleToEdit, setIsEligibleToEdit] = useState(false);

    useEffect(() => {
        const checkElligibility = async () => {
            const editAllocationEligibility =
                await checkEligibilityFundAllocation(
                    policy.planCode,
                    policy.policyNumber
                );
            if (editAllocationEligibility?.status === 'success') {
                setIsEligibleToEdit(true);
            }
        };
        checkElligibility();
    }, []);
    // Sidesheet Support
    const sideSheet = useSideSheetContext();
    const openSideBar = () => {
        sideSheet.changeSideSheetContent(
            t('fundAllocation.editAllocationsTitle') as string,
            <EditAllocationsContent
                funds={funds}
                policyNumber={policy.policyNumber}
                planCode={policy.planCode ?? ''}
                notElectedfunds={notElectedfunds}
                sideSheet={sideSheet}
                investmentType={policy.investmentType}
                policyOwner={policy.allOwners[0].fullName}
                policy={policy.policy}
            />
        );
        sideSheet.handleOpen(true);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex gap-2">
                <Typography variant={TypographyVariant.LabelLg}>
                    {title}
                </Typography>
                <Popover
                    title={title as string}
                    body={titleTooltip}
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

            {!loading && showAllocationBar && (
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                        <FieldLabel label="Fund allocation" />
                        {featureFlags[
                            FEATURE_FLAGS.FUND_ALLOCATION_TRANSACTION
                        ] && (
                            <button
                                className={`flex items-center gap-1 ${
                                    isEligibleToEdit
                                        ? 'text-[var(--color-base-text-link)]'
                                        : 'text-[var(--color-states-inactive-text-inactive-text)]'
                                }`}
                                onClick={
                                    isEligibleToEdit ? openSideBar : undefined
                                }
                                disabled={!isEligibleToEdit}
                            >
                                <SettingsIcon
                                    width={16}
                                    height={16}
                                    className={
                                        isEligibleToEdit
                                            ? 'cursor-pointer'
                                            : 'cursor-not-allowed'
                                    }
                                />
                                <Typography
                                    className={
                                        isEligibleToEdit
                                            ? 'cursor-pointer'
                                            : 'cursor-not-allowed'
                                    }
                                    variant={TypographyVariant.Label}
                                >
                                    {t('fundAllocation.editAllocationsTitle')}
                                </Typography>
                            </button>
                        )}
                    </div>
                    <AllocationColorBar colors={getAllocationColors(funds)} />
                </div>
            )}
            <FundsTable
                funds={funds}
                loading={loading}
                policy={policy}
                caption={caption}
            />
        </div>
    );
};

export default FundsCard;
