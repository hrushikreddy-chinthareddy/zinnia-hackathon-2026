import * as Dialog from '@radix-ui/react-dialog';
import { Button, Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useState } from 'react';

import styles from './ConfirmDialogLink.module.css';

export interface ConfirmDialogLinkProps {
  cancelText?: string;
  cancelCallback?: () => void;
  confirmCallback?: () => void;
  confirmText?: string;
  linkText?: string;
  message?: string;
  title?: string;
}


export const ConfirmDialogLink: React.FC<ConfirmDialogLinkProps> = ({
  cancelText = 'No',
  cancelCallback,
  confirmCallback,
  confirmText = 'Yes',
  linkText = 'Open',
  message,
  title = 'Are you sure?',
}: ConfirmDialogLinkProps) => {
  const [open, setOpen] = useState(false);

  const cancel = () => {
    cancelCallback?.();
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <span>
          <Button className={styles.confirmTrigger} mode="link">{linkText}</Button>
        </span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={clsx(styles.confirmDialogOverlay, 'DialogOverlay')} />
        <Dialog.Content className={styles.confirmDialog}>
          <Dialog.Title className={clsx(styles.title)}>
            {title}
            <Dialog.Close asChild>
              <Button aria-label="Close" mode="link" onClick={cancel}>
                <Icon type={IconType.CLOSE} />
              </Button>
            </Dialog.Close>
          </Dialog.Title>
          <Dialog.Description className={clsx(styles.message, 'typography-content-body')}>{message}</Dialog.Description>
          <div className={styles.buttons}>
            <Dialog.DialogClose asChild>
              <Button mode="primary" onClick={() => { confirmCallback?.() }}>
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
