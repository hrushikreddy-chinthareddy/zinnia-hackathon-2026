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
  ...props
}: ButtonProps) => {
  const modeClasses =
    mode === 'link' ? linkClasses.linkContainer : classes[mode];

  const buttonClasses = clsx(
    classes.button,
    modeClasses,
    classes[size],
    {
      [classes.selected as string]: selected,
      [classes.disabled as string]: disabled,
    },
    className
  );

  return (
    <button
      {...props}
      type="button"
      className={buttonClasses}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
