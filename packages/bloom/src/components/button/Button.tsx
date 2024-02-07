import classes from './Button.module.css';
import { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {

  /**
   * Is this the principal call to action on the page?
   */
  mode?: 'primary' | 'secondary';

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
}

/**
 * Primary UI component for user interaction
 */
export const Button = ({
  mode = 'primary',
  size = 'large',
  className,
  children,
  selected = false,
  ...props
}: ButtonProps) => (
  <button
    {...props}
    type="button"
    className={[classes.button, classes[mode], classes[size], selected && classes.selected, className].join(' ')}
  >
    {children}
  </button>
);
