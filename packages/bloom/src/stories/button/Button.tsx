import './button.css';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {

  /**
   * Is this the principal call to action on the page?
   */
  mode?: 'primary' | 'secondary';

  /**
   * How large should the button be?
   */
  size?: 'small' | 'large';

  /**
   * Button contents
   */
  label: string;
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
  label,
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      type="button"
      className={['button', `button--${size}`, `button--${mode}`].join(' ')}

    >
      {label}
    </button>
  );
};
