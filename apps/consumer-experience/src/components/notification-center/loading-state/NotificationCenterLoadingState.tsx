import { Icon, IconType } from '@zinnia/bloom/components';

import Styles from '@/components/notification-center/NotificationCenter.module.css';
import { SkeletonLoader } from '@/components/skeleton-loader/SkeletonLoader';

export const NotificationCenterItemLoadingState = (
  <div className={Styles.item}>
    <SkeletonLoader className={Styles.title} width="100%" height="1.5rem" />
    <div className={Styles.date}>
      <Icon small type={IconType.CALENDAR} />
      <SkeletonLoader width="8ch" height="1.5rem" />
    </div>
    <SkeletonLoader className={Styles.link} width="50%" height="1.5rem" />
  </div>
);
