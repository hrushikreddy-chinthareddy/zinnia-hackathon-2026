'use client';

import { PiiProps } from '@/types/pii';
import { formatPhoneNumberWithExtension } from '@/utils/data';
import { Phone } from '@zinnia/api-types/types/sor';

import { PiiWrapper } from './PiiWrapper';

interface Props extends PiiProps {
  phoneNumber: Phone;
}

export const PhoneNumber = ({ phoneNumber, ...rest }: Props) => {
  return (
    <PiiWrapper {...rest}>
      {formatPhoneNumberWithExtension(phoneNumber)}
    </PiiWrapper>
  );
};
