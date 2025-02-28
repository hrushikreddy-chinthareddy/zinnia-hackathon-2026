'use client';

import { Button, type ButtonProps } from '@zinnia/bloom/components';
import { isValidElement } from 'react';

import { useUser } from '@/hooks/use-user';
import { analytics } from '@/utils/segment';

function getChildPlainText(children: React.ReactNode): string {
  let text = '';

  if (!children) {
    return text;
  }

  if (typeof children === 'string') {
    text += children;
  } else if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (typeof child === 'string') {
        text += child;
      } else if (typeof child === 'object' && isValidElement(child)) {
        const childText = getChildPlainText(
          (child as React.ReactElement).props.children
        );

        if (childText) {
          text += childText;
        }
      }
    }
  }

  return text;
}

type ConditionalProps =
  | {
      type: 'submit';
      /**
       * If the button is used in a transaction flow,
       * include the correlationId associated with that transaction
       */
      correlationId?: string;
    }
  | {
      type?: 'button' | 'reset';
      correlationId?: never;
    };

type Props = ButtonProps & ConditionalProps;

// TODO: should the name be explicit about the analytics or should
// it just be ConsumerButton or something? is there a time when we wouldn't
// use analytics on a button?
export const ButtonWithAnalytics = ({
  children,
  correlationId,
  ...props
}: Props) => {
  const { user } = useUser();

  const trackAndClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    analytics.track('button_clicked', {
      buttonText:
        getChildPlainText(children) ||
        props['aria-label'] ||
        'unknown button text',
      userId: user?.partyId,
      ...(correlationId && { correlationId }),
    });

    props.onClick?.(event);
  };

  return (
    <Button {...props} onClick={trackAndClick}>
      {children}
    </Button>
  );
};
