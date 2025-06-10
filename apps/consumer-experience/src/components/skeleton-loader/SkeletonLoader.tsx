import clsx from 'clsx';

import styles from './SkeletonLoader.module.css';

interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  width: string;
  height: string;
}

export const SkeletonLoader = ({
  width,
  height,
  className,
}: SkeletonLoaderProps) => {
  return (
    <span
      style={{ width, height }}
      className={clsx(styles.skeletonBox, className)}
    />
  );
};
