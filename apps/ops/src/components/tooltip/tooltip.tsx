import * as ReactTooltip from '@radix-ui/react-tooltip';
import clsx from 'clsx';
import React from 'react';

import { TooltipTest } from '@deps/jest/constants/test-id-constants';

import { PopoverPlacement } from '../popover/popover';
import {
    getPlacementProps,
    commonPopoverClasses,
    commonTriggerClasses,
} from '../popover/popover.helpers';

export { PopoverPlacement } from '../popover/popover';

interface Props {
    children: React.ReactNode;
    placement: PopoverPlacement;
    body: React.ReactNode;
    triggerClassName?: string;
    popoverClassName?: string;
    isTabbable?: boolean;
}

const Tooltip = ({
    children,
    placement,
    body,
    triggerClassName,
    popoverClassName,
    isTabbable = true,
}: Props) => {
    const { side, align } = getPlacementProps(placement);

    const tooltipContent = (
        <div className={`${commonPopoverClasses} ${popoverClassName}`}>
            <span className="body-sm">{body}</span>
        </div>
    );

    return (
        <ReactTooltip.Provider>
            <ReactTooltip.Root>
                <ReactTooltip.Trigger asChild>
                    <span
                        className={clsx(commonTriggerClasses, triggerClassName)}
                        data-testid={TooltipTest.Tooltip}
                        tabIndex={isTabbable ? 0 : -1}
                        role="note"
                    >
                        {children}
                    </span>
                </ReactTooltip.Trigger>
                <ReactTooltip.Portal>
                    <ReactTooltip.Content
                        side={side}
                        align={align}
                        className="z-20 my-0.5"
                        data-testid={TooltipTest.Body}
                    >
                        {tooltipContent}
                    </ReactTooltip.Content>
                </ReactTooltip.Portal>
            </ReactTooltip.Root>
        </ReactTooltip.Provider>
    );
};

export default Tooltip;
