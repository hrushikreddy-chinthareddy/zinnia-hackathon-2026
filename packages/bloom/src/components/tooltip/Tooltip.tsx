
import * as RadixTooltip from '@radix-ui/react-tooltip';
import clsx from 'clsx';

import { zIndexOrder } from '@/utils/zIndexOrder';

import { TooltipPlacement, TooltipProps, getPlacementProps } from './utils';
import styles from './tooltip.module.css';

export const Tooltip = ({ tooltipClassName, trigger, placement = TooltipPlacement.BottomRight, children}: TooltipProps) => {
  const { side, align } = getPlacementProps(placement);

  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger className={styles.tooltipTrigger}
         style={{ zIndex: zIndexOrder.CardPopoverTrigger }}>
          {trigger}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content side={side} align={align} style={{ zIndex: zIndexOrder.Popover }} className={clsx(tooltipClassName, styles.tooltipContainer)}>
            <span className="typography-content-body-sm">{children}</span>
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};