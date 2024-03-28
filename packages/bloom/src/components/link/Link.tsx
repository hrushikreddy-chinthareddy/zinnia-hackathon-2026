import clsx from 'clsx';
import { Icon, IconType } from '../icon';

import styles from './Link.module.css';
import buttonStyles from '../button/Button.module.css';

export interface LinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
  iconType?: IconType;
  text: string;
  /*
   * Defaults to standard size
   */
  size?: 'small' | 'standard';
  /**
   * For when you need a semantic link that appears like a button
   */
  variant?: 'button';
}

export const Link = ({
  iconType,
  href,
  text,
  size = 'standard',
  variant,
  style,
}: LinkProps) => {
  return (
    <a
      className={clsx(styles.linkContainer, {
        [styles.button as string]: variant === 'button',
        [buttonStyles.button as string]: variant === 'button',
        [buttonStyles.primary as string]: variant === 'button',
      })}
      href={href}
      style={style}
    >
      {iconType && <Icon type={iconType} />}
      <span
        className={clsx({
          'typography-nav-links-sm': size === 'small',
          'typography-nav-links': size === 'standard',
        })}
      >
        {text}
      </span>
    </a>
  );
};
