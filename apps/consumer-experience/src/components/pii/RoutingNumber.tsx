'use client';

import { PiiWrapper } from '@/components/pii/PiiWrapper';
import { PiiProps } from '@/types/pii';
import { checkIfNull } from '@/utils/data';

interface Props extends PiiProps {
  routingNumber?: string;
}

export const RoutingNumber = ({ routingNumber, ...rest }: Props) => {
  return <PiiWrapper {...rest}>{checkIfNull(routingNumber)}</PiiWrapper>;
};
