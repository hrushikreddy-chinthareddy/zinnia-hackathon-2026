'use client';

import {
  Link as BloomLink,
  LinkProps as BloomLinkProps,
} from '@zinnia/bloom/components';
import NextLink from 'next/link';
import { AnchorHTMLAttributes } from 'react';

import { analytics } from '@/utils/segment';

// @TODO anssam: pass additionalContext prop
interface CommonProps {
  correlationId?: string;
  isInternal?: boolean;
  isNativeAnchorTag?: boolean;
  additionalContext?: string;
}

// if isInternal is true, the props extend NextLinkProps,
// otherwise they extend BloomLinkProps
export type Props =
  | (CommonProps &
      React.ComponentProps<typeof NextLink> & {
        isInternal: true;
        isNativeAnchorTag?: false | null;
      })
  | (CommonProps &
      React.DetailedHTMLProps<
        AnchorHTMLAttributes<HTMLAnchorElement>,
        HTMLAnchorElement
      > & {
        isInternal?: false | null;
        isNativeAnchorTag: true;
      })
  | (CommonProps &
      BloomLinkProps & {
        isInternal?: false | null;
        isNativeAnchorTag?: false | null;
      });

export const Link = (props: Props): React.ReactElement => {
  const { onClick, correlationId, additionalContext } = props;

  const trackAndClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const getLinkText = (): string => {
      // check if the children of the next link are a string (could be a component like an icon)
      const isValidString = typeof props.children === 'string';
      const internalLinkText = isValidString
        ? (props.children as string)
        : props['aria-label'] || 'unknown link text';

      if (props.isInternal || props.isNativeAnchorTag) {
        return internalLinkText;
      }

      return props.text;
    };

    analytics.track('link_clicked', {
      additionalContext,
      linkText: getLinkText(),
      ...(correlationId && { correlationId }),
    });

    onClick?.(event);
  };

  if (props.isInternal) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { children, isInternal, isNativeAnchorTag, ...rest } = props;

    return (
      <NextLink {...rest} onClick={trackAndClick}>
        {children}
      </NextLink>
    );
  }

  if (props.isNativeAnchorTag) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { children, isInternal, isNativeAnchorTag, ...rest } = props;

    return (
      <a {...rest} onClick={trackAndClick}>
        {props.children}
      </a>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isInternal: _, isNativeAnchorTag: __, ...rest } = props;
  return <BloomLink {...rest} onClick={trackAndClick} />;
};
