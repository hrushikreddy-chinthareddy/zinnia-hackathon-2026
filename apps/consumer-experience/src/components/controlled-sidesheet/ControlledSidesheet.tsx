import { SideSheet, type SideSheetProps } from '@zinnia/bloom/components';
import { FC, PropsWithChildren, useState } from 'react';

import styles from './ControlledSidesheet.module.css';

type ControlledSidesheetProps = {
  closeBeforeContent?: React.ReactNode;
} & SideSheetProps;

export const ControlledSidesheet: FC<
  PropsWithChildren<ControlledSidesheetProps>
> = ({ children, ...props }) => {
  const [open, setOpen] = useState(false);

  return (
    <SideSheet
      {...props}
      overrideOpen={open}
      trigger={
        <button
          className={styles.unstyledButtons}
          type="button"
          aria-label={`Open ${props.header}`}
          onClick={() => setOpen(true)}
        >
          {props.trigger}
        </button>
      }
    >
      {props.closeBeforeContent && (
        <button
          className={styles.closeBeforeContent}
          type="button"
          aria-label={`Close ${props.header}`}
          onClick={() => setOpen(false)}
        >
          {props.closeBeforeContent}
        </button>
      )}
      {children}
    </SideSheet>
  );
};
