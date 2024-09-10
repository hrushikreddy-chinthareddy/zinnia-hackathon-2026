import { Icon, IconType } from '@zinnia/bloom/components';

import AllocationColorBar, { AllocationColor } from '@deps/components/allocation-color-bar/allocation-color-bar';
import FieldLabel from '@deps/components/fields/field-label';
import Popover, { PopoverPlacement } from '@deps/components/popover/popover';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { getBeneficiaryColor } from '@deps/containers/people-card-container/people-card-container.helper';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import FundsTable from './funds-table';
import { FundViewModel } from '../types';

interface FundsCardProps {
    loading?: boolean;
    funds?: FundViewModel[];
    title?: string;
    titleTooltip?: string;
}

const getAllocationColors = (funds?: FundViewModel[]): AllocationColor[] => {
    const colors: AllocationColor[] = [];

    funds?.forEach((fund, index) => {
        const allocationValue = fund.allocation?.toString().replace(/%$/, '') || '0';
        if (!isNullEmptyOrUndefined(fund.allocation)) {
            colors.push({
                allocationPercentage: allocationValue,
                className: getBeneficiaryColor(index),
            });
        }
    });

    return colors;
};

const FundsCard = ({ funds, loading, title, titleTooltip }: FundsCardProps) => {
    const showAllocationBar = funds?.some(fund =>fund.allocation !== DEFAULT_ERROR_STRING);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex gap-2">
                <Typography variant={TypographyVariant.LabelLg}>{title}</Typography>
                <Popover title={title as string} body={titleTooltip} placement={PopoverPlacement.TopRight}>
                    <Icon type={IconType.CIRCLE_INFO} color="var(--color-primary-color-primary)" height={16} width={16} />
                </Popover>
            </div>
            {!loading && showAllocationBar && (
                <div className="flex flex-col gap-2">
                    <FieldLabel label="Fund allocation" />
                    <AllocationColorBar colors={getAllocationColors(funds)} />
                </div>
            )}
            <FundsTable funds={funds} loading={loading} />
        </div>
    );
};

export default FundsCard;
