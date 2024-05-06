import classes from './Button.module.css';
import linkClasses from '../link/Link.module.css';
import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Is this the principal call to action on the page?
   */
  mode?: 'primary' | 'secondary' | 'link';

  /**
   * How large should the button be?
   */
  size?: 'small' | 'large';

  /**
   * render selected styles
   */
  selected?: boolean;

  /**
   * Optional click handler
   */
  onClick?: () => void;
  disabled?: boolean;
  expand?: boolean;
}

/**
 * Primary UI component for user interaction
 */
export const Button = ({
  mode = 'primary',
  size = 'large',
  className,
  children,
  disabled,
  selected = false,
  type = 'button',
  expand = false,
  ...props
}: ButtonProps) => {
  const modeClasses =
    mode === 'link'
      ? `${linkClasses.linkContainer} ${classes.link}`
      : classes[mode];

  const buttonClasses = clsx(
    classes.button,
    modeClasses,
    classes[size],
    {
      [classes.selected as string]: selected,
      [classes.disabled as string]: disabled,
    },
    expand ? classes.expand : '',
    className
  );

  return (
    <button
      {...props}
      type={type}
      className={buttonClasses}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
