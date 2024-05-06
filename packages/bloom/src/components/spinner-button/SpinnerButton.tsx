import { Button, ButtonProps } from '../button';
import { Loader, LoaderProps } from '../loader';
import clsx from 'clsx';

import classes from './SpinnerButton.module.css';

export interface SpinnerButtonProps extends ButtonProps, LoaderProps {}

export const SpinnerButton = ({
  disabled,
  variant,
  hide,
  type,
  className,
  expand,
  children,
  ...rest
}: SpinnerButtonProps) => {
  const buttonClasses = clsx(classes.button, className);
  return (
    <Button
      className={buttonClasses}
      expand={expand}
      type={type}
      disabled={disabled}
      {...rest}
    >
      {children}
      <Loader variant={variant} hide={hide} />
    </Button>
  );
};
