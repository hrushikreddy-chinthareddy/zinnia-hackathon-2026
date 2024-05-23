'use client';

import { PiiProps } from '@/types/pii';

export const PiiWrapper = ({ children, ...rest }: PiiProps) => {
  return (
    <span data-ispii="true" {...rest}>
      {children}
    </span>
  );
};
