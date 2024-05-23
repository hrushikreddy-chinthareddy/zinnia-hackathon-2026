'use client';

import { PiiProps } from '@/types/pii';
import { bankAccountNumberSanitizer } from '@/utils/data';

import { PiiWrapper } from './PiiWrapper';

interface Props extends PiiProps {
  accountNumber?: string;
}

export const AccountNumber = ({ accountNumber, ...rest }: Props) => {
  return (
    <PiiWrapper {...rest}>
      {bankAccountNumberSanitizer(accountNumber)}
    </PiiWrapper>
  );
};
