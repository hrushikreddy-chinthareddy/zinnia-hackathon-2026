import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import Link from 'next/link';
import { PropsWithChildren } from 'react';

import { toTitleCase } from '@/utils/strings';

import styles from './HeaderLink.module.css';

export interface HeaderButtonProps extends PropsWithChildren {
  title?: string;
  className?: string;
  onClick?: () => void;
}
export const HeaderButton = ({
  children,
  className,
  onClick,
  title,
}: HeaderButtonProps) => {
  const formatTitle = toTitleCase(title);

  return (
    <div className={clsx(styles.headerLinkContainer, className)}>
      {onClick && (
        <button className={styles.headerLinkAction} onClick={onClick}>
          <Icon
            type={IconType.CHEVRON}
            className={styles.headerLinkChevron}
            color="var(--color-base-icon-icon-action, #1E359C)"
          />
        </button>
      )}
      <h1 className="typography-desktop-headline-1d">{formatTitle}</h1>
      {children}
    </div>
  );
};
