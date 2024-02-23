'use client';
import { Icon, IconType } from '../icon';
import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { SideSheetLocation, SideSheetProps } from './types';

import { zIndexOrder } from '../../utils/zIndexOrder';

import styles from './SideSheet.module.css';

export const SideSheet = ({
  children,
  closeCallback,
  header,
  location = SideSheetLocation.Right,
  preventCloseOnOutsideClick = true,
  trigger,
}: SideSheetProps) => {
  // TODO: figure out type here
  const preventInteraction = (
    event: CustomEvent<{ originalEvent: PointerEvent }>
  ) => {
    event.preventDefault();
  };

  return (
    <Dialog.Root modal>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className={styles.sideSheetBackgroundOverlay}
          style={{ zIndex: zIndexOrder.Overlay }}
        />
        <Dialog.Content
          onPointerDownOutside={
            preventCloseOnOutsideClick ? preventInteraction : undefined
          }
          className={clsx(styles.sideSheetContent, {
            [styles.sideSheetContentRight as string]:
              location === SideSheetLocation.Right,
            [styles.sideSheetContentLeft as string]:
              location === SideSheetLocation.Left,
          })}
          style={{ zIndex: zIndexOrder.Dialog }}
          onCloseAutoFocus={closeCallback}
        >
          <div
            className={styles.sideSheetHeaderContainer}
            style={{ zIndex: zIndexOrder.Dialog + 1 }}
          >
            <div className={styles.sideSheetHeader}>
              <Dialog.Title>{header}</Dialog.Title>
              <Dialog.Close aria-label="Close">
                <Icon
                  type={IconType.CLOSE}
                  color={'var(--color-base-icon-icon-action)'}
                />
              </Dialog.Close>
            </div>
          </div>
          <div className={styles.sideSheetDescription}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
