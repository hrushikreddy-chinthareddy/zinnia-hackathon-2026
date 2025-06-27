import { Skeleton } from '@radix-ui/themes';
import { PolicyStatus, ProductType } from '@zinnia/api-types/types/sor';
import clsx from 'clsx';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import Badge from '@deps/components/badge/badge';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import { GlobalValues } from '@deps/components/global-values/global-values.types';
import Highlighter from '@deps/components/highlighter/highlighter';
import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Tooltip, { PopoverPlacement } from '@deps/components/tooltip/tooltip';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { mapProductTypeToTranslation } from '@deps/helpers/translation.helpers';
import {
    getCarrierLogoByClientId,
    getCarrierNameByClientId,
} from '@deps/utils/carriers';

export const PolicyNumber = ({
    policyNumber,
    highlight,
}: Partial<GlobalValues>) => {
    const value = highlight ? (
        <Highlighter
            text={policyNumber?.toString() || ''}
            highlights={[highlight]}
        />
    ) : (
        policyNumber
    );

    return (
        value && (
            <PiiWrapper className="mr-4 mt-[-1px] font-primary text-[22px] leading-6 text-gray-900">
                {value}
            </PiiWrapper>
        )
    );
};

export const PolicyBadgeStatus = ({
    status = PolicyStatus.NOTISSUED,
    variant,
    tooltip,
    tooltipPlacements = PopoverPlacement.TopRight,
}: Partial<GlobalValues>) => {
    return (
        <div className="mt-[-3px]">
            {!!status && !!tooltip && (
                <Tooltip placement={tooltipPlacements} body={tooltip}>
                    <Badge
                        rounded={true}
                        label={status}
                        variant={variant as BadgeVariant}
                        className="w-max"
                    />
                </Tooltip>
            )}
        </div>
    );
};

export const getCarrierLogoSrc = (marketingName: string): string => {
    const baseUrl = `${process.env.NEXT_PUBLIC_S3_BUCKET_BASE_URL}/images`;

    if (!marketingName?.length) {
        return `${baseUrl}/logos/zinnia-icon.svg`;
    }

    const kebobMarketingName = marketingName?.toLowerCase().replace(' ', '-');

    return `${baseUrl}/carrier-logos/${kebobMarketingName}.svg`;
};

export const PolicyCarrierLogo = ({
    carrierId,
    tooltipPlacements = PopoverPlacement.TopRight,
}: Partial<GlobalValues>) => {
    const carrierName = getCarrierNameByClientId(carrierId as string);

    return (
        <div className="mr-2">
            {carrierId &&
                (carrierName ? (
                    <Tooltip
                        placement={tooltipPlacements}
                        body={carrierName}
                        triggerClassName="!rounded cursor-default"
                    >
                        <div className="self-center pb-[1.5px] pt-[1.5px]">
                            <div className="default-focus flex h-12 w-12 items-center justify-center rounded border-2 border-gray-100 bg-white">
                                <Image
                                    alt={carrierName}
                                    width={48}
                                    height={48}
                                    src={getCarrierLogoByClientId(carrierId)}
                                />
                            </div>
                        </div>
                    </Tooltip>
                ) : (
                    <div className="self-center pb-[1.5px] pt-[1.5px]">
                        <div className="default-focus flex h-12 w-12 items-center justify-center rounded border-2 border-gray-100 bg-white">
                            <Image
                                alt={
                                    getCarrierNameByClientId(carrierId) ||
                                    carrierId
                                }
                                width={48}
                                height={48}
                                src={getCarrierLogoByClientId(carrierId)}
                            />
                        </div>
                    </div>
                ))}
        </div>
    );
};

export const PolicyProductType = ({
    productType,
    tooltipPlacements = PopoverPlacement.TopRight,
    openSideSheet,
}: Partial<GlobalValues>) => {
    const { t } = useTranslation();
    const isClickable = !!openSideSheet;
    const { acronym, label } = mapProductTypeToTranslation(
        productType as ProductType,
        t
    );

    return (
        <div className="mb-[4.5px] mr-2 mt-[1.5px] flex self-center">
            {acronym && (
                <Tooltip
                    placement={tooltipPlacements}
                    body={label}
                    triggerClassName="!rounded"
                >
                    <div>
                        <Badge
                            variant={
                                isClickable
                                    ? BadgeVariant.Brand
                                    : BadgeVariant.Neutral
                            }
                            label={acronym}
                        />
                    </div>
                </Tooltip>
            )}
        </div>
    );
};

export const PolicyProductMarketingName = ({
    marketingName,
    openSideSheet,
}: Partial<GlobalValues>) => {
    const isClickable = !!openSideSheet;

    const classes = clsx('z-0', {
        'mb-[3px] cursor-pointer': isClickable,
        'mt-[1px]': !isClickable,
    });

    return isClickable ? (
        <NavElement
            size={NavElementSize.Small}
            type={NavElementType.Button}
            className={classes}
            onClick={openSideSheet}
        >
            {marketingName}
        </NavElement>
    ) : (
        <Typography variant={TypographyVariant.LabelMd} className={classes}>
            {marketingName}
        </Typography>
    );
};

export interface PolicyInfoProps {
    carrierId?: string;
    highlight?: string;
    loadingPolicyDetails?: boolean; // Whether details are still loading and we should use partial data
    marketingName?: string;
    openSideSheet?: () => void;
    planCode?: string;
    planName?: string;
    policyNumber?: string;
    productType?: ProductType;
    status: PolicyStatus;
    tooltip: string;
    tooltipAmount?: string;
    tooltipPlacements?: PopoverPlacement;
    variant: BadgeVariant;
}

const PolicyInfo = ({
    carrierId,
    highlight,
    loadingPolicyDetails = false,
    marketingName,
    openSideSheet,
    planName,
    policyNumber,
    productType,
    status,
    tooltip,
    tooltipAmount,
    tooltipPlacements,
    variant,
}: PolicyInfoProps) => {
    return (
        <div className="flex items-center">
            <Skeleton
                loading={loadingPolicyDetails && !carrierId}
                width="48px"
                height="48px"
                className="mr-1"
            />
            <PolicyCarrierLogo
                carrierId={carrierId}
                tooltipPlacements={tooltipPlacements}
            />
            <div className="flex w-max flex-col">
                <div className="flex flex-row">
                    <Skeleton
                        loading={loadingPolicyDetails && !productType}
                        width="36px"
                        height="28px"
                    />
                    <PolicyProductType
                        productType={productType}
                        tooltipPlacements={tooltipPlacements}
                        openSideSheet={openSideSheet}
                    />
                    <Skeleton
                        loading={
                            loadingPolicyDetails && !marketingName && !planName
                        }
                        width="80px"
                        height="28px"
                    />
                    <PolicyProductMarketingName
                        marketingName={marketingName || planName}
                        openSideSheet={openSideSheet}
                    />
                </div>
                <div className="flex items-center">
                    <Skeleton
                        loading={loadingPolicyDetails && !policyNumber}
                        width="128px"
                        height="24px"
                    />
                    <PolicyNumber
                        policyNumber={policyNumber}
                        highlight={highlight}
                    />
                    <Skeleton
                        loading={loadingPolicyDetails && !status}
                        width="60px"
                        height="34px"
                        className="ml-2"
                    />
                    <PolicyBadgeStatus
                        status={status}
                        tooltip={tooltip}
                        variant={variant}
                        tooltipPlacements={tooltipPlacements}
                        tooltipAmount={tooltipAmount}
                    />
                </div>
            </div>
        </div>
    );
};

export default PolicyInfo;
