'use client';

import { PiiProps } from '@/types/pii';
import { checkIfNull } from '@/utils/data';

import { PiiWrapper } from './PiiWrapper';

interface Props extends PiiProps {
  payee?: string;
}

export const Payee = ({ payee, ...rest }: Props) => {
  return (
    <PiiWrapper data-ispii="true" {...rest}>
      {checkIfNull(payee)}
    </PiiWrapper>
  );
};
