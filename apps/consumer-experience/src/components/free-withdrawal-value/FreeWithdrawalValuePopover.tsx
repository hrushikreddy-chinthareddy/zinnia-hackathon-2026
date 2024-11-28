import { LabelPopover } from '../label-popover/LabelPopover';
const FreeWithdrawalAmount = 'Free Withdrawal Amount';

export const FreeWithdrawalValuePopover = ({
  percentValue = '0',
}: {
  percentValue?: string | null;
}) => {
  const content = `This is the amount you can withdraw from your annuity's account value right now without paying fees to do so. It's ${percentValue}% of your current account value. `;

  return <LabelPopover title={FreeWithdrawalAmount}>{content}</LabelPopover>;
};
