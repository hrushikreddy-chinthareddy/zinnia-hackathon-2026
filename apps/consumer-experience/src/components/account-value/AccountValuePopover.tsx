import { standardDateMonthDayYear } from '@/utils/dates';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';

import { LabelPopover } from '../label-popover/LabelPopover';
const ACCOUNT_VALUE = 'Account value';

export const AccountValuePopover = ({
  dataTimestamp,
  lineOfBusiness,
}: {
  dataTimestamp?: string | null;
  lineOfBusiness?: LineOfBusiness;
}) => {
  const content =
    lineOfBusiness === LineOfBusiness.ANNUITY
      ? `This is how much money is held in your annuity as of ${standardDateMonthDayYear(dataTimestamp)}.`
      : `This is how much money is held in your policy as of ${standardDateMonthDayYear(dataTimestamp)}. Policy value may grow over time as the premium dollars allocated to your account value earn interest.`;

  return <LabelPopover title={ACCOUNT_VALUE}>{content}</LabelPopover>;
};
