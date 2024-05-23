'use client';

import { PiiProps } from '@/types/pii';

import { PiiWrapper } from './PiiWrapper';

interface Props extends PiiProps {
  emailAddress?: string | null;
}

export const Email = ({ emailAddress, ...rest }: Props) => {
  return <PiiWrapper {...rest}>{emailAddress}</PiiWrapper>;
};
