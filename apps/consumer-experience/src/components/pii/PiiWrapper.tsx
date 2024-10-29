'use client';

import { PiiProps } from '@/types/pii';

// This component adds the attribute that mouseflow uses to hide any user pii data. Input fields get hidden automatically
// so they do not need the attribute
export const PiiWrapper = ({ children, ...rest }: PiiProps) => {
  return (
    <span data-ispii="true" {...rest}>
      {children}
    </span>
  );
};
