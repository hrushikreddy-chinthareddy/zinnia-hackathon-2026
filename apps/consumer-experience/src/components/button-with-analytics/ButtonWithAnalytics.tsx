'use client';

import { Button, type ButtonProps } from '@zinnia/bloom/components';

import { useUser } from '@/hooks/use-user';
import { analytics } from '@/utils/segment';

interface CommonProps {
  /**
   * Describe what the button is for
   */
  analyticsTitle: string;
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

type Props = ButtonProps & CommonProps & ConditionalProps;

// TODO: should the name be explicit about the analytics or should
// it just be ConsumerButton or something? is there a time when we wouldn't
// use analytics on a button?
export const ButtonWithAnalytics = ({
  analyticsTitle,
  children,
  correlationId,
  ...props
}: Props) => {
  const { user } = useUser();

  const trackAndClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    analytics.track('button_clicked', {
      buttonText: analyticsTitle,
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
