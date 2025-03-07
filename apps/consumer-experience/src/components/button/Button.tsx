'use client';

import {
  Button as BloomButton,
  type ButtonProps,
  Loader,
  LoaderVariant,
} from '@zinnia/bloom/components';
import { useRef } from 'react';

import { useUser } from '@/hooks/use-user';
import { analytics } from '@/utils/segment';

interface AdditionalProps {
  correlationId?: string;
  /**
   * Button to provide additional segment context about where the action
   * took place
   */
  additionalContext?: string;
  loading?: boolean;
}

type Props = ButtonProps & AdditionalProps;

/**
 * A button wrapper that includes segment tracking
 *
 * ATTENTION!! If the button does not include action context in the text of the button
 * AND does not include aria-label e.g. a cancel button on a transaction
 * include additional context via the additionalContext prop
 */
export const Button = ({
  additionalContext,
  children,
  correlationId,
  loading,
  ...props
}: Props) => {
  const { user } = useUser();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const trackAndClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    analytics.track('button_clicked', {
      additionalContext,
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
      <>
        {children}
        {loading && (
          <span className="ml-sm">
            <Loader variant={LoaderVariant.CTA} />
          </span>
        )}
      </>
    </BloomButton>
  );
};
