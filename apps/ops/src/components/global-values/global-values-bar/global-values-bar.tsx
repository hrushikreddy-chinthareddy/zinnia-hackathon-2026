import clsx from 'clsx';

import PolicyInfo, {
    PolicyInfoProps,
} from '@deps/components/global-values/policy-info/policy-info';
import {
    PolicyJointOwner,
    PolicyJointOwnerProps,
} from '@deps/components/global-values/policy-joint-owner/policy-joint-owner';
import {
    PolicyOwner,
    PolicyOwnerProps,
} from '@deps/components/global-values/policy-owner/policy-owner';
import { LabelContentSkeleton } from '@deps/containers/policy-summary-card/skeletons';

import { DocumentInfo } from '../document-info';

export interface GlobalValuesBarProps
    extends PolicyInfoProps,
        PolicyOwnerProps,
        PolicyJointOwnerProps {
    children?: React.ReactNode;
    divider?: boolean;
    showJointOwner?: boolean;
    showLink?: boolean;
    showDocument?: boolean;
    documentNumber?: string;
    showLoader?: boolean;
    className?: string;
}

const GlobalValuesBar = ({
    carrierId,
    children,
    highlight,
    marketingName,
    openSideSheet,
    owner,
    jointOwner,
    planCode,
    planName,
    policyNumber,
    productType,
    status,
    tooltip,
    tooltipAmount,
    tooltipPlacements,
    variant,
    divider = true,
    showJointOwner = false,
    showLink = true,
    showDocument = false,
    documentNumber,
    showLoader,
    className,
}: GlobalValuesBarProps) => {
    const renderWithSkeleton = (
        condition: boolean,
        children: React.ReactNode
    ) => {
        return condition ? (
            <div className="flex flex-col mx-8 ml-0">
                <LabelContentSkeleton />
                <LabelContentSkeleton />
            </div>
        ) : (
            children
        );
    };

    return (
        <div
            className={clsx(
                'flex w-full flex-col pb-4 md:pb-6 lg:pb-8 lg:flex-row',
                className
            )}
        >
            <div className="mr-0 flex flex-col md:flex-row">
                {renderWithSkeleton(
                    !!showLoader && !carrierId,
                    <PolicyInfo
                        carrierId={carrierId}
                        highlight={highlight}
                        marketingName={marketingName}
                        openSideSheet={openSideSheet}
                        policyNumber={policyNumber}
                        planName={planName}
                        productType={productType}
                        status={status}
                        tooltip={tooltip}
                        tooltipAmount={tooltipAmount}
                        tooltipPlacements={tooltipPlacements}
                        variant={variant}
                    />
                )}
                {policyNumber && divider && (
                    <div className="mx-8 flex w-0.5 border-l-2 border-l-gray-200" />
                )}
                {renderWithSkeleton(
                    !!showLoader && !owner,
                    <PolicyOwner
                        owner={owner}
                        planCode={planCode}
                        policyNumber={policyNumber}
                        displaySSN={showJointOwner}
                        showLink={showLink}
                    />
                )}
                {showJointOwner && (
                    <>
                        {jointOwner && <div className="mx-4 flex w-0.5" />}
                        <PolicyJointOwner
                            jointOwner={jointOwner}
                            planCode={planCode}
                            policyNumber={policyNumber}
                            showLink={showLink}
                        />
                    </>
                )}
                {showDocument && (
                    <>
                        {documentNumber && <div className="mx-4 flex w-0.5" />}
                        <DocumentInfo documentNumber={documentNumber ?? ''} />
                    </>
                )}
            </div>
            {children}
        </div>
    );
};

export default GlobalValuesBar;
