'use client';

import { PiiProps } from '@/types/pii';
import { DEFAULT_ERROR_STRING } from '@/utils/strings';

import { PiiWrapper } from './PiiWrapper';

interface Props extends PiiProps {
  displayName?: string | null;
}

export const Name = ({ displayName, ...rest }: Props) => {
  if (!displayName) {
    return DEFAULT_ERROR_STRING;
  }

  return <PiiWrapper {...rest}>{displayName}</PiiWrapper>;
};
