import styles from './SkeletonLoader.module.css';

export const SkeletonLoader = ({
  width,
  height,
}: {
  width: string;
  height: string;
}) => {
  return <div style={{ width, height }} className={styles.skeletonBox}></div>;
};
