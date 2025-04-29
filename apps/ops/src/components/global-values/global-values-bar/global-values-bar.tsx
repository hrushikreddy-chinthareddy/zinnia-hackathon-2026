import PolicyInfo, { PolicyInfoProps } from '@deps/components/global-values/policy-info/policy-info';
import { PolicyJointOwner, PolicyJointOwnerProps } from '@deps/components/global-values/policy-joint-owner/policy-joint-owner';
import { PolicyOwner, PolicyOwnerProps } from '@deps/components/global-values/policy-owner/policy-owner';

import { DocumentInfo } from '../document-info';

export interface GlobalValuesBarProps extends PolicyInfoProps, PolicyOwnerProps, PolicyJointOwnerProps {
    children?: React.ReactNode;
    divider?: boolean;
    showJointOwner?: boolean;
    showLink?: boolean;
    showDocument?: boolean;
    documentNumber?: string;
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
}: GlobalValuesBarProps) => {
    return (
        <div className={'flex w-full flex-col pb-4 md:pb-6 lg:pb-8 lg:flex-row'}>
            <div className="mr-0 flex flex-col md:flex-row">
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
                {policyNumber && divider && <div className="mx-8 flex w-0.5 border-l-2 border-l-gray-200" />}
                <PolicyOwner
                    owner={owner}
                    planCode={planCode}
                    policyNumber={policyNumber}
                    displaySSN={showJointOwner}
                    showLink={showLink}
                />
                {showJointOwner && (
                    <>
                        {jointOwner && <div className="mx-4 flex w-0.5" />}
                        <PolicyJointOwner jointOwner={jointOwner} planCode={planCode} policyNumber={policyNumber} showLink={showLink} />
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
