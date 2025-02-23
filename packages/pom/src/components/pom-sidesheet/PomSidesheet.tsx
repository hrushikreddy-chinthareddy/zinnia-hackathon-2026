import { FC, ReactNode, useState, cloneElement, isValidElement } from 'react';
import { SideSheet, SideSheetProps } from '@zinnia/bloom/components';
import { default as PomStyles } from '../../styles/pom.module.css';

export interface PomSideSheetProps
  extends Omit<SideSheetProps, 'children' | 'overrideOpen'> {
  trigger: ReactNode;
  children: ReactNode;
}

export interface WithSideSheetClose {
  onSideSheetClose?: () => void;
}

export const PomSideSheet: FC<PomSideSheetProps> = ({
  trigger,
  children,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // close sidesheet when the child component calls the onSideSheetClose function
  // for example, when the user clicks a "close" button in the child component, or "cancel"
  const childrenWithClose = isValidElement(children)
    ? cloneElement(children, {
        onSideSheetClose: () => {
          setIsOpen(false);
        },
      } as WithSideSheetClose)
    : children;

  // when the trigger is clicked, open the sidesheet
  const triggerWithClick = isValidElement(trigger)
    ? cloneElement(trigger, {
        onClick: () => {
          setIsOpen(true);
          trigger.props.onClick?.();
        },
      } as WithSideSheetClose)
    : trigger;

  return (
    <SideSheet
      {...props}
      overrideOpen={isOpen}
      trigger={triggerWithClick}
      closeCallback={() => setIsOpen(false)}
    >
      <div id={PomStyles['producer-onboarding-maintenance']}>
        {childrenWithClose}
      </div>
    </SideSheet>
  );
};
