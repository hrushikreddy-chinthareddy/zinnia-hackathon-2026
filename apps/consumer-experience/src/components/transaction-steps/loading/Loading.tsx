import { Loader } from '@zinnia/bloom/components';

import styles from '../transaction-steps.module.css';

export const Loading = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <Loader />
        </div>
        <h3 className="typography-desktop-headline-3-d">We're working on it</h3>
      </div>
    </div>
  );
};
