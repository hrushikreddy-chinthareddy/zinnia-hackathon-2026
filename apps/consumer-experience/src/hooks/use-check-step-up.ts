import dayjs from 'dayjs';

import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { useFeatureFlags } from './use-feature-flags';
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
  const { data: featureFlagData } = useFeatureFlags();
  const lastStepUpTime = user?.stepUpTime;

  const checkIdentityCodeFlag =
    featureFlagData?.[FEATURE_FLAGS.TRANSACTION_LEVEL_CODE_ADD_BANK];

  if (!checkIdentityCodeFlag) {
    return false;
  }

  if (!lastStepUpTime) {
    return true;
  }

  const lastStepUpTimeDate = dayjs(lastStepUpTime);

  return dayjs().diff(lastStepUpTimeDate, 'minute') > 15;
};
