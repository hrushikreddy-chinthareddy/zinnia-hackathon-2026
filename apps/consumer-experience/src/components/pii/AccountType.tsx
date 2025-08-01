'use client';

import { AccountType as SORAccountType } from '@xd/api-types/dist/generated-types/sor';

import { PiiWrapper } from '@/components/pii/PiiWrapper';
import { PaymentusAccountType } from '@/types/paymentus';
import { PiiProps } from '@/types/pii';
import { toSentenceCase } from '@/utils/strings';

import { getAccountTypeDisplay } from '../paymentus/utils';

interface Props extends PiiProps {
  accountType?: string;
}

export const AccountType = ({ accountType, ...rest }: Props) => {
  const formattedAccountType = getAccountTypeDisplay(
    accountType as PaymentusAccountType | SORAccountType
  );
  return (
    <PiiWrapper {...rest}>{toSentenceCase(formattedAccountType)}</PiiWrapper>
  );
};
