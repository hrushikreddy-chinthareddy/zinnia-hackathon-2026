import clsx from 'clsx';

import PolicyInfo, { PolicyInfoProps } from '@deps/components/global-values/policy-info/policy-info';
import { PolicyJointOwner, PolicyJointOwnerProps } from '@deps/components/global-values/policy-joint-owner/policy-joint-owner';
import { PolicyOwner, PolicyOwnerProps } from '@deps/components/global-values/policy-owner/policy-owner';

export interface GlobalValuesBarProps extends PolicyInfoProps, PolicyOwnerProps, PolicyJointOwnerProps {
    children?: React.ReactNode;
    isNavDrawerOpen?: boolean;
    divider?: boolean;
    showJointOwner?: boolean
}

const GlobalValuesBar = ({
    carrierId,
    children,
    highlight,
    isNavDrawerOpen,
    marketingName,
    openSideSheet,
    owner,
    jointOwner,
    planCode,
    policyNumber,
    productType,
    status,
    tooltip,
    tooltipAmount,
    tooltipPlacements,
    variant,
    divider = true,
    showJointOwner = false
}: GlobalValuesBarProps) => {
    const headerClasses = clsx('flex w-full flex-col pb-4 md:pb-6 lg:pb-8', isNavDrawerOpen ? 'lg:flex-col xl:flex-row' : 'lg:flex-row');
    return (
        <div className={headerClasses}>
            <div className="mr-0 flex flex-col md:flex-row" >
                <PolicyInfo
                    carrierId={carrierId}
                    highlight={highlight}
                    marketingName={marketingName}
                    openSideSheet={openSideSheet}
                    policyNumber={policyNumber}
                    productType={productType}
                    status={status}
                    tooltip={tooltip}
                    tooltipAmount={tooltipAmount}
                    tooltipPlacements={tooltipPlacements}
                    variant={variant}
                />
                {divider && <div className="mx-8 flex w-0.5 border-l-2 border-l-gray-200" />}
                <PolicyOwner owner={owner} planCode={planCode} policyNumber={policyNumber} displaySSN={showJointOwner} />
                <div className="mx-4 flex w-0.5" />
                {showJointOwner && <PolicyJointOwner jointOwner={jointOwner} planCode={planCode} policyNumber={policyNumber} />}

            </div>
            {children}
        </div>
    );
};

export default GlobalValuesBar;
