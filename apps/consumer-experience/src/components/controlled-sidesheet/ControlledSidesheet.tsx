import {
  SideSheet,
  type SideSheetProps,
  Icon,
  IconType,
} from '@zinnia/bloom/components';
import { FC, PropsWithChildren, useState } from 'react';

import { Button } from '@/components/button/Button';

import styles from './ControlledSidesheet.module.css';

type ControlledSidesheetProps = {
  closeBeforeContent?: string;
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
        <Button
          className={`${styles.closeBeforeContent} mt-md mb-xl`}
          size="small"
          mode="link"
          style={{ padding: 0 }}
          onClick={() => setOpen(false)}
        >
          <Icon small type={IconType.CHEVRON} className={styles.chevronBack} />
          {props.closeBeforeContent}
        </Button>
      )}
      {children}
    </SideSheet>
  );
};
