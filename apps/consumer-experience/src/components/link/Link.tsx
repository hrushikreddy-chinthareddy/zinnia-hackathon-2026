'use client';

import {
  Link as BloomLink,
  LinkProps as BloomLinkProps,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import NextLink from 'next/link';
import { AnchorHTMLAttributes } from 'react';

import { analytics } from '@/utils/segment';

import { default as styles } from './Link.module.css';

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

      return internalLinkText;
    };

    analytics.track('link_clicked', {
      additionalContext,
      linkText: getLinkText(),
      ...(correlationId && { correlationId }),
    });

    onClick?.(event);
  };

  if (props.isInternal) {
    const { children, isInternal, isNativeAnchorTag, ...rest } = props;

    return (
      <NextLink {...rest} onClick={trackAndClick}>
        {children}
      </NextLink>
    );
  }

  if (props.isNativeAnchorTag) {
    const { children, isInternal, isNativeAnchorTag, ...rest } = props;

    return (
      <a {...rest} onClick={trackAndClick}>
        {props.children}
      </a>
    );
  }

  const {
    isInternal: _,
    isNativeAnchorTag: __,
    className,
    ...rest
  } = props as CommonProps &
    BloomLinkProps & {
      isInternal?: false | null;
      isNativeAnchorTag?: false | null;
    };
  return (
    <BloomLink
      className={clsx(styles.link, className)}
      {...rest}
      onClick={trackAndClick}
    />
  );
};
