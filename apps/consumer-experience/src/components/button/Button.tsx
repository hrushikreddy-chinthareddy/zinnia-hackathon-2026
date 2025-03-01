'use client';

import {
  Button as BloomButton,
  type ButtonProps,
} from '@zinnia/bloom/components';
import { useRef } from 'react';

import { useUser } from '@/hooks/use-user';
import { analytics } from '@/utils/segment';

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
      correlationId?: string;
    };

type Props = ButtonProps & ConditionalProps;

export const Button = ({ children, correlationId, ...props }: Props) => {
  const { user } = useUser();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const trackAndClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    analytics.track('button_clicked', {
      buttonText:
        buttonRef.current?.innerText ||
        props['aria-label'] ||
        'unknown button text',
      userId: user?.partyId,
      ...(correlationId && { correlationId }),
    });

    props.onClick?.(event);
  };

  return (
    <BloomButton {...props} onClick={trackAndClick} ref={buttonRef}>
      {children}
    </BloomButton>
  );
};
