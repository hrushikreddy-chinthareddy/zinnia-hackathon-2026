'use client';

import { PiiProps } from '@/types/pii';
import { checkIfNull } from '@/utils/data';

import { PiiWrapper } from './PiiWrapper';

interface Props extends PiiProps {
  bankName?: string;
}

export const BankName = ({ bankName, ...rest }: Props) => {
  return (
    <PiiWrapper data-ispii="true" {...rest}>
      {/* Formatting uppercase is the best solution based on the return from zahara */}
      {checkIfNull(bankName?.toUpperCase())}
    </PiiWrapper>
  );
};
