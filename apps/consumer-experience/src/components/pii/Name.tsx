'use client';

import { PiiProps } from '@/types/pii';

import { PiiWrapper } from './PiiWrapper';

interface Props extends PiiProps {
  displayName?: string | null;
}

export const Name = ({ displayName, ...rest }: Props) => {
  return <PiiWrapper {...rest}>{displayName}</PiiWrapper>;
};
