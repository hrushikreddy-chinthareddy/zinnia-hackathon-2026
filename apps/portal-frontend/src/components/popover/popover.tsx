import * as ReactPopover from '@radix-ui/react-popover';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { PopoverTest } from '@deps/jest/constants/test-id-constants';
import { ReactComponent as CancelIcon } from '@deps/styles/elements/icons/actions/cancel.svg';

import { getPlacementProps, commonPopoverClasses, commonTriggerClasses } from './popover.helper';

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

    const popoverContent = (
        <div className={clsx(commonPopoverClasses, popoverClassName)}>
            <div className="flex justify-between">
                <p className="label-lg mb-1 mr-6" data-testid={PopoverTest.Title}>
                    {title}
                </p>
                <ReactPopover.Close className={`default-focus-icons test-cancel-icon !absolute right-2 top-2.5 cursor-pointer rounded-xl`}>
                    <CancelIcon width={24} height={24} data-testid={PopoverTest.Cancel} />
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
                <ReactPopover.Content align={align} side={side} className="z-20 my-0.5" data-testid={PopoverTest.Content}>
                    {popoverContent}
                </ReactPopover.Content>
            </ReactPopover.Portal>
        </ReactPopover.Root>
    );
}
