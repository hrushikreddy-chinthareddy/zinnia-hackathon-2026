import clsx from 'clsx';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';

import { SkeletonLoader } from '../SkeletonLoader';
import styles from './policy-page-skeletons.module.css';

export const LargeSkeleCard = () => {
  return (
    <ClickableCardContainer>
      <LargeSkeleContent />
    </ClickableCardContainer>
  );
};

export const LargeSkeleContent = () => {
  return (
    <div
      className={clsx('stacked-items justify-center', styles.largeSkele)}
      style={{ gap: 'var(--measure-dimension-gap-sm)' }}
    >
      <SkeletonLoader width="150px" height="14px" />
      <SkeletonLoader width="125px" height="14px" />
      <SkeletonLoader width="175px" height="14px" />
    </div>
  );
};

export const AdditionalLinkSkele = () => {
  return (
    <div
      className={clsx('stacked-items justify-center', styles.smallSkele)}
      style={{ gap: 'var(--measure-dimension-gap-sm)' }}
    >
      <SkeletonLoader width="150px" height="14px" />
    </div>
  );
};
