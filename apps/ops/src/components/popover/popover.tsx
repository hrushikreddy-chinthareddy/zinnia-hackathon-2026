import * as ReactPopover from '@radix-ui/react-popover';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { PopoverTest } from '@deps/jest/constants/test-id-constants';
import { ReactComponent as CancelIcon } from '@deps/styles/elements/icons/actions/cancel.svg';
import { HIDE_ANNUITIES_TOOLTIPS_DEPU_2749 } from '@deps/types/constants';

import {
    getPlacementProps,
    commonPopoverClasses,
    commonTriggerClasses,
} from './popover.helpers';

export enum PopoverPlacement {
    TopRight = 'top-right',
    TopLeft = 'top-left',
    BottomRight = 'bottom-right',
    BottomLeft = 'bottom-left',
}

export type PopoverProps = {
    placement?: PopoverPlacement;
    title: string | JSX.Element;
    body: React.ReactNode;
    children: React.ReactNode;
    popoverClassName?: string;
    triggerClassName?: string;
};

export default function Popover({
    children,
    title,
    body,
    placement = PopoverPlacement.BottomRight,
    popoverClassName,
    triggerClassName,
}: PopoverProps) {
    const { side, align } = getPlacementProps(placement);
    const { t } = useTranslation();
    const { policyDetails } = useContext(PolicyData);
    const router = useRouter();

    const handleEscapeKeyDown = (event: KeyboardEvent) => {
        // DEPU-6604: In cases where this may be used in a side sheet, we need to stop propagation
        // to prevent the side sheet from closing
        event.stopPropagation();
    };

    if (router) {
        const isPoliciesPage = router.pathname.includes('policies');
        const hideTooltips =
            HIDE_ANNUITIES_TOOLTIPS_DEPU_2749 &&
            isPoliciesPage &&
            !!policyDetails.isAnnuity;
        if (hideTooltips) {
            return null;
        }
    }

    const popoverContent = (
        <div
            className={clsx(commonPopoverClasses, 'relative', popoverClassName)}
        >
            <div className="flex justify-between">
                <p
                    className="label-lg mb-1 mr-6"
                    data-testid={PopoverTest.Title}
                >
                    {title}
                </p>
                <ReactPopover.Close
                    className={`default-focus-icons test-cancel-icon !absolute right-2 top-2.5 cursor-pointer rounded-xl`}
                >
                    <CancelIcon
                        width={24}
                        height={24}
                        data-testid={PopoverTest.Cancel}
                    />
                </ReactPopover.Close>
            </div>
            <span className="body-sm" data-testid={PopoverTest.Body}>
                {body}
            </span>
        </div>
    );

    return (
        <ReactPopover.Root>
            <ReactPopover.Trigger
                className={clsx(commonTriggerClasses, triggerClassName)}
                data-testid={PopoverTest.Popover}
                aria-label={`${t('ariaLabel.popover')} ${title}`}
            >
                {children}
            </ReactPopover.Trigger>
            <ReactPopover.Portal>
                <ReactPopover.Content
                    align={align}
                    side={side}
                    className="z-20 my-0.5"
                    data-testid={PopoverTest.Content}
                    onEscapeKeyDown={handleEscapeKeyDown}
                >
                    {popoverContent}
                </ReactPopover.Content>
            </ReactPopover.Portal>
        </ReactPopover.Root>
    );
}
