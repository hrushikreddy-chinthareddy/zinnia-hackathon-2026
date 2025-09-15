'use client';

import { PiiProps } from '@/types/pii';

import { PiiWrapper } from './PiiWrapper';
import { DEFAULT_ERROR_STRING } from '@xd/utils/dist';

interface Props extends PiiProps {
  displayName?: string | null;
}

export const Name = ({ displayName, ...rest }: Props) => {
  if (!displayName) {
    return DEFAULT_ERROR_STRING;
  }

  return <PiiWrapper {...rest}>{displayName}</PiiWrapper>;
};
