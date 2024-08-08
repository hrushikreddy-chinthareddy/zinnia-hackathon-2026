import { ActionTypes, BpmBankAction } from '@/store/store';
import { PolicyProfile } from '@/types/policy';

/**
 * We only want to poll the endpoint if a change happened and we're tracking for it.
 * @param data
 * @param bpmAction
 * @returns
 */
export const shouldStopBankPolling = (
  data?: PolicyProfile,
  bpmAction?: BpmBankAction | null
) => {
  if (!bpmAction) return true;

  const { bankDetails } = data || {};
  const { actionType, changes, bankAccountNumber } = bpmAction;

  switch (actionType) {
    case ActionTypes.ADD:
      return bankDetails?.some(
        bank => bank.accountNumber === bankAccountNumber
      );
    case ActionTypes.EDIT: //There can be multiple changes, we just want to make sure one shows up so polling can end
      return changes?.every(change =>
        bankDetails?.some(
          bank =>
            change.fieldName &&
            bank[change.fieldName] === change.value &&
            bank.accountNumber === bank.accountNumber
        )
      );
    case ActionTypes.REMOVE:
      return !bankDetails?.some(
        bank => bank.accountNumber === bankAccountNumber
      );
    default:
      return true;
  }
};
