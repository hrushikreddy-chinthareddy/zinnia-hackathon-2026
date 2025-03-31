import { MutableRefObject } from 'react';

import { ActionTypes, BpmAction, PropertyKeys } from '@/store/store';
import { PolicyProfile } from '@/types/policy';

const POLL_INTERVAL = 1000;
const POLL_LIMIT = 5;

interface RefetchArgs {
  data: PolicyProfile[keyof PolicyProfile];
  bpmAction: BpmAction | null | undefined;
  propertyKey: PropertyKeys;
  pollCount: MutableRefObject<number>;
  logHandler: () => void;
  finishedHandler: () => void;
}

/**
 *
 * Shared refetchHandler to be used in Tanstack Queries that need to poll an endpoint for BPM changes.
 * See BankList or AddressList for examples.
 */
export const refetchHandler = ({
  data,
  bpmAction,
  propertyKey,
  pollCount,
  logHandler,
  finishedHandler,
}: RefetchArgs) => {
  if (bpmAction?.propertyKey !== propertyKey) return false;

  //If we triggered stopPolling or if pollCount is greater than our limit
  if (shouldStopPolling(data, bpmAction) || pollCount.current >= POLL_LIMIT) {
    // if pollCount has reached the limit and there is no change to the data, send a log
    if (
      !shouldStopPolling(data, bpmAction) &&
      pollCount.current >= POLL_LIMIT
    ) {
      logHandler();
    }

    //Then trigger the finishedHandler and clear out the interval and stop polling
    if (bpmAction) {
      finishedHandler();
    }
    pollCount.current = 0;
    return false;
  }

  // If we havent triggered stop polling and havent reached the limit, iterate again
  pollCount.current++;
  return POLL_INTERVAL;
};

/**
 * This is used for Tanstack queries mainly, when we need to poll an endpoint to watch for changes
 * that we've sent to BPM.
 *
 * I have data set to any in the loops, because typescript was a total cluster.
 */
export const shouldStopPolling = (
  data: PolicyProfile[keyof PolicyProfile],
  bpmAction: BpmAction | null
) => {
  if (!bpmAction) return true;
  const { actionType, changes, itemValue, itemKey } = bpmAction;

  switch (actionType) {
    // if any identifing key is found, stop polling
    case ActionTypes.ADD:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data as any[])?.some(item => item[itemKey] === itemValue);

    // Loop through the changes that we tracked. If those changes are found in data, stop polling
    case ActionTypes.EDIT:
      return changes?.every(change =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data as any[])?.some(
          item =>
            change.fieldName &&
            item[change.fieldName] === change.value &&
            item[itemKey] === itemValue
        )
      );

    // As long as the item we removed disappears, stop polling
    case ActionTypes.REMOVE:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return !(data as any[])?.some(item => item[itemKey] === itemValue);
    default:
      return true;
  }
};
