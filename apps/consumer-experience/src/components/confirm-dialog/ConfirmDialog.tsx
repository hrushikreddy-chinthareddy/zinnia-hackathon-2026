import * as Dialog from '@radix-ui/react-dialog';
import { Button, Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useState } from 'react';

import { zIndexOrder } from '@/utils/zIndexOrder';

import styles from './ConfirmDialog.module.css';

export interface ConfirmDialogProps {
  cancelText?: string;
  cancelCallback?: () => void;
  confirmCallback?: () => void;
  confirmText?: string;
  linkText?: string;
  message?: string;
  title?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  cancelText = 'No',
  cancelCallback,
  confirmCallback,
  confirmText = 'Yes',
  linkText = 'Open',
  message,
  title = 'Are you sure?',
}: ConfirmDialogProps) => {
  const [open, setOpen] = useState(false);

  const cancel = () => {
    cancelCallback?.();
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button className={styles.confirmTrigger} mode="link">
          {linkText}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            zIndex: zIndexOrder.Overlay,
          }}
          className={clsx(styles.confirmDialogOverlay)}
        />
        <Dialog.Content
          className={styles.confirmDialog}
          style={{ zIndex: zIndexOrder.Dialog }}
        >
          <Dialog.Title className={clsx(styles.title)}>
            {title}
            <Dialog.Close asChild>
              <Button aria-label="Close" mode="link" onClick={cancel}>
                <Icon type={IconType.CLOSE} />
              </Button>
            </Dialog.Close>
          </Dialog.Title>
          <Dialog.Description
            className={clsx(styles.message, 'typography-content-body')}
          >
            {message}
          </Dialog.Description>
          <div className={styles.buttons}>
            <Dialog.DialogClose asChild>
              <Button
                mode="primary"
                onClick={() => {
                  confirmCallback?.();
                }}
              >
                {confirmText}
              </Button>
            </Dialog.DialogClose>
            <Dialog.DialogClose asChild>
              <Button mode="secondary" onClick={cancel}>
                {cancelText}
              </Button>
            </Dialog.DialogClose>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
