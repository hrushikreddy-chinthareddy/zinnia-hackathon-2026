import dayjs from 'dayjs';

import { useUser } from './use-user';

/**
 * Checks if it's been more than 15 minutes since the last time the user has gone through step up.
 * If it has, then it will return true. If not, it will return false.
 *
 * @returns {boolean} Whether or not it's been more than 15 minutes since the last time the user has gone through step up.
 */
// TODO: come up with better name
export const useCheckStepUp = () => {
  const { user } = useUser();
  const lastStepUpTime = user?.stepUpTime;

  if (!lastStepUpTime || !dayjs.unix(lastStepUpTime).isValid()) {
    return true;
  }

  const lastStepUpTimeDate = dayjs.unix(lastStepUpTime);

  return dayjs().diff(lastStepUpTimeDate, 'minute') > 15;
};
