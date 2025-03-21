'use client';

import { PiiProps } from '@/types/pii';
import { checkIfNull } from '@/utils/data';

import { PiiWrapper } from './PiiWrapper';

interface Props extends PiiProps {
  payor?: string;
}

export const Payor = ({ payor, ...rest }: Props) => {
  return (
    <PiiWrapper data-ispii="true" {...rest}>
      {checkIfNull(payor)}
    </PiiWrapper>
  );
};
