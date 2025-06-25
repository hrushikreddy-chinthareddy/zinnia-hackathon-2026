import clsx from 'clsx';
import React from 'react';

interface SlotType extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  renderComponent?: React.ReactElement;
}

/**
 * Slot is a component that renders an optional `renderComponent` with children inside of it
 * If `renderComponent` is not provided, it will render only the children as they were originally passed.
 * If `renderComponent` is provided the children will be cloned inside of the new component passes as a prop.
 */
export const Slot = ({ renderComponent, children, ...props }: SlotType) => {
  if (React.isValidElement(renderComponent)) {
    const renderComponentProps =
      renderComponent.props as React.HtmlHTMLAttributes<HTMLElement>;

    // Basically when renderComponent is provided, that new element is rendered with the initial children inside of it
    return React.cloneElement(
      renderComponent,
      {
        ...props,
        ...renderComponentProps,
        className: clsx(props.className, renderComponentProps.className),
      } as React.HtmlHTMLAttributes<HTMLElement>,
      children
    );
  }

  if (React.Children.count(children) > 1) {
    React.Children.only(null);
  }

  return null;
};
