'use client';

import { DEFAULT_ERROR_STRING } from '@xd/utils/dist';

import { PiiProps } from '@/types/pii';

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
