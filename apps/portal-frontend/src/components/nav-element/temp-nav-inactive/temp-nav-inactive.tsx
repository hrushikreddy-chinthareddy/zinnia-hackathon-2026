import clsx from 'clsx';
import React, { PropsWithChildren, ReactNode } from 'react';

import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import Tooltip, { PopoverPlacement } from '@deps/components/tooltip/tooltip';
import { ReactComponent as BanIcon } from '@deps/styles/elements/icons/content/ban.svg';
type TempNavInactiveProps = {
    tooltipBody: ReactNode;
    triggerClassName?: string;
    navElementClassName?: string;
    hideIcon?: boolean;
} & PropsWithChildren;

export const isStillInactive = {
    peoplePageHeader: 'Refer to guidelines for instructions to add a new person.',
    beneficiaryCardContainer: 'Refer to guidelines for instructions to edit allocations.',
    interiorPeoplePageHeader: 'Refer to guidelines for instructions to add or remove roles.',
    interiorPeoplePageDOB: 'Refer to guidelines for instructions to edit date of birth.',
    loanPageHeader: 'Refer to guidelines for instructions to start a loan.',
    loanPageStartNew: 'Refer to guidelines for instructions to start a loan.',
    loanPageSetUpAutopay: 'Refer to guidelines for instructions to set up autopay.',
    loanPageManageAutopay: 'Refer to guidelines for instructions to manage autopay.',
    loanPageOTP: 'Refer to guidelines for instructions to make one-time payment.',
    withdrawalPageexchange1035: 'Refer to guidelines for instructions to process 1035 exchange.',
};

// https://zinnia.atlassian.net/browse/DEPU-1936
const TempNavInactive = ({ children, tooltipBody, triggerClassName, navElementClassName, hideIcon }: TempNavInactiveProps) => {
    return (
        <Tooltip
            isTabbable={false}
            triggerClassName={clsx('cursor-not-allowed', triggerClassName)}
            placement={PopoverPlacement.TopRight}
            body={tooltipBody}
        >
            <NavElement
                disabled
                startIcon={!hideIcon && <BanIcon height={16} />}
                size={NavElementSize.Small}
                type={NavElementType.Link}
                tabIndex={0}
                style={{
                    backgroundColor: 'var(--color-base-surface-surface-tertiary)',
                    color: 'var(--color-base-text-text-secondary)',
                }}
                className={clsx(
                    'pointer-events-none flex items-center whitespace-nowrap rounded-sm px-2 py-1 align-middle font-semibold',
                    navElementClassName
                )}
            >
                {children}
            </NavElement>
        </Tooltip>
    );
};

export default TempNavInactive;
