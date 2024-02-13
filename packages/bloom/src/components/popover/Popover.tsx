"use client";
import { Icon, IconType } from "../icon";
import * as ReactPopover from "@radix-ui/react-popover";
import clsx from "clsx";
import { ReactNode } from "react";
import { useWindowSize } from "react-use";

import { SideSheet } from "../side-sheet";
import { zIndexOrder } from "../../utils/zIndexOrder";

import { PopoverPlacement, getPlacementProps } from "./popover.helper";
import styles from "./Popover.module.css";

// TODO: replace these
// import { PopoverTest } from '@deps/jest/constants/test-id-constants';

export type PopoverProps = {
  children: ReactNode;
  placement?: PopoverPlacement;
  popoverClassName?: string;
  // TODO: this is used as the aria label, should it only accept a string? what if it is optional?
  title: string | JSX.Element;
  trigger: ReactNode;
};

export const Popover = ({
  children,
  placement = PopoverPlacement.BottomRight,
  popoverClassName,
  title,
  trigger,
}: PopoverProps) => {
  const { side, align } = getPlacementProps(placement);
  const { width } = useWindowSize();

  const popoverContent = (
    <div className={clsx(popoverClassName, styles.popoverContainer)}>
      <div className={styles.popoverTitleContainer}>
        <div className="typography-labels-label-lg">{title}</div>
        <ReactPopover.Close>
          <Icon type={IconType.CLOSE} color="white" />
        </ReactPopover.Close>
      </div>
      <span className="typography-content-body-sm">{children}</span>
    </div>
  );

  if (width >= 500) {
    return (
      <ReactPopover.Root>
        <ReactPopover.Trigger
          className={styles.popoverTrigger}
          style={{ zIndex: zIndexOrder.CardPopoverTrigger }}
          aria-label={`more info about ${title}`}
        >
          {trigger}
        </ReactPopover.Trigger>
        <ReactPopover.Portal>
          <ReactPopover.Content
            align={align}
            side={side}
            style={{ zIndex: zIndexOrder.Popover }}
          >
            {popoverContent}
          </ReactPopover.Content>
        </ReactPopover.Portal>
      </ReactPopover.Root>
    );
  }

  return (
    <SideSheet
      trigger={
        <button
          className={styles.popoverTrigger}
          aria-label={`more info about ${title}`}
          style={{ zIndex: zIndexOrder.CardPopoverTrigger }}
        >
          {trigger}
        </button>
      }
      header={title}
    >
      {children}
    </SideSheet>
  );
};
