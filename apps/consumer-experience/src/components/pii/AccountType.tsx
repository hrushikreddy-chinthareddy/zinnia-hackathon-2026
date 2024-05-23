'use client';

import { PiiWrapper } from '@/components/pii/PiiWrapper';
import { PiiProps } from '@/types/pii';
import { toSentenceCase } from '@/utils/strings';

interface Props extends PiiProps {
  accountType?: string;
}

export const AccountType = ({ accountType, ...rest }: Props) => {
  return <PiiWrapper {...rest}>{toSentenceCase(accountType)}</PiiWrapper>;
};
