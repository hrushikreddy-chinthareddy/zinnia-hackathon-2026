'use client';

import {
  Button as BloomButton,
  type ButtonProps,
  Loader,
  LoaderVariant,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { forwardRef, useRef } from 'react';

import { useUser } from '@/hooks/use-user';
import { analytics } from '@/utils/segment';

import styles from './Button.module.css';

interface AdditionalProps {
  correlationId?: string;
  'data-testid'?: string;
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
export const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      additionalContext,
      children,
      correlationId,
      loading,
      'data-testid': testId,
      ...props
    },
    forwardRef
  ) => {
    const { user } = useUser();
    const buttonRef = useRef<HTMLButtonElement | null>(null);

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
      <BloomButton
        {...props}
        data-testid={testId || 'bloom-button'}
        disabled={props.disabled || loading}
        className={clsx(styles.content, props.className)}
        onClick={trackAndClick}
        ref={forwardRef || buttonRef}
      >
        <>
          {children}
          {loading && <Loader variant={LoaderVariant.CTA} />}
        </>
      </BloomButton>
    );
  }
);

Button.displayName = 'Button';
