'use client';

import { Icon, IconType } from '@zinnia/bloom/components';
import { useParams } from 'next/navigation';

import { Link } from '@/components/link/Link';
import styles from '@/components/nav/Nav.module.css';
import { useComponentVisibility } from '@/hooks/use-component-visibility';
import { useFeatureFlagsFor } from '@/hooks/use-feature-flags';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';
import { useShowNotificationAlertBasedOn } from '@/hooks/use-show-notification-alert';
import { ComponentName } from '@/services/display-rules/types';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { SkeletonLoader } from '../skeleton-loader/SkeletonLoader';

export const NotificationIcon = () => {
  const { policyNumber, planCode, lineOfBusinessUrl, lineOfBusiness } =
    usePolicyUrlInputs();
  const NOTIFICATION_HREF = `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/notifications`;
  const params = useParams();

  const { data: fetchNotificationsFlagEnabled } = useFeatureFlagsFor(
    FEATURE_FLAGS.TRANSACTION_NOTIFICATIONS
  );

  const { data: visibility } = useComponentVisibility(planCode, policyNumber);
  const { showNotificationAlert, acknowledgedNotificationsLoading } =
    useShowNotificationAlertBasedOn({
      planCode,
      policyNumber,
      lineOfBusiness,
    });

  const notInPolicy = !planCode || !policyNumber;

  if (
    !fetchNotificationsFlagEnabled ||
    !visibility?.[ComponentName.NOTIFICATIONS] ||
    notInPolicy
  )
    return null;

  return (
    <Link isInternal href={NOTIFICATION_HREF} className={styles.notification}>
      {acknowledgedNotificationsLoading ? (
        <SkeletonLoader width="36px" height="24px" />
      ) : (
        <>
          <Icon className={styles.bell} type={IconType.ALERT} />
          {showNotificationAlert && (
            <Icon
              className={styles.exclamation}
              type={IconType.CIRCLE_EXCLAMATION}
            />
          )}
        </>
      )}
    </Link>
  );
};
