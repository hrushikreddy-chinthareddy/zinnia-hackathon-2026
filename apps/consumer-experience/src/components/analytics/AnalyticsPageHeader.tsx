'use client';

import { createElement, useEffect } from 'react';

import { useUser } from '@/hooks/use-user';
import { analytics } from '@/utils/segment';

type AnalyticsHeaderProps = {
  pageTitle: string;
  className?: string;
  heading?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  analyticsProps: {
    [key: string]: unknown;
  };
};

export const AnalyticsPageHeader = ({
  pageTitle,
  className,
  heading = 'h1',
  analyticsProps,
}: AnalyticsHeaderProps) => {
  const { user } = useUser();

  useEffect(() => {
    analytics.page(pageTitle, analyticsProps);
  }, [pageTitle, user, analyticsProps]);

  // render pageTitle as children
  const children = pageTitle;

  return createElement(
    heading,
    { className: className || 'typography-desktop-headline-1d' },
    children
  );
};
