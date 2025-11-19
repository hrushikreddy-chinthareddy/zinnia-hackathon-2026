'use client';

import { PaymentusAccountType } from '@/types/paymentus';
import { PiiProps } from '@/types/pii';
import { checkIfNull } from '@/utils/data';
import { AccountType } from '@zinnia/api-types/types/sor';

import { PiiWrapper } from './PiiWrapper';
import { getBranchName } from '../paymentus/utils';

interface Props extends PiiProps {
  bankName?: string;
  accountType?: string;
}

export const BankName = ({ bankName, accountType, ...rest }: Props) => {
  const formattedBankName = getBranchName({
    type: accountType as PaymentusAccountType | AccountType,
    bankName,
  });

  return (
    <PiiWrapper data-ispii="true" {...rest}>
      {/* Formatting uppercase is the best solution based on the return from zahara */}
      {checkIfNull(formattedBankName?.toUpperCase())}
    </PiiWrapper>
  );
};
