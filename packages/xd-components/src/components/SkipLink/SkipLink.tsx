import { ButtonStyles, ButtonProps } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { HTMLAttributes } from 'react';

import styles from './SkipLink.module.css';

interface SkipLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  tabIndex?: number;
  href?: string;
  size?: ButtonProps['size'];
}

export const SkipLink = ({
  tabIndex = 0,
  href = '#main',
  size = 'small',
  ...props
}: SkipLinkProps) => {
  return (
    <a
      href={href}
      className={clsx(ButtonStyles.link, ButtonStyles[size], styles.skipLink)}
      tabIndex={tabIndex}
      aria-label="Skip to main content"
      title="Skip to main content"
      {...props}
    >
      Skip to main content
    </a>
  );
};
