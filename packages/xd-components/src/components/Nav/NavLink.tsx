import React from 'react';
import { Slot } from './Slot';

export type AsChildProps<DefaultElementProps> = {
  renderComponent?: React.ReactElement;
} & DefaultElementProps;

type NavLinkProps = AsChildProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>
> & {
  style?: React.CSSProperties;
  className?: string;
};

export const NavLink = ({
  renderComponent,
  children,
  ...props
}: NavLinkProps) => {
  // If renderComponent is provided, that new element is rendered with the initial children inside of it and props spread to it
  // If there is nothing provided for render component, default to rendering a link with the children inside of it

  const Component = renderComponent ? Slot : 'a';

  return (
    <Component
      {...renderComponent?.props}
      renderComponent={renderComponent}
      {...props}
    >
      {children}
    </Component>
  );
};
