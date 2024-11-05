import { Loader } from '@zinnia/bloom/components';

import styles from './Loading.module.css';

export const Loading = () => {
  return (
    <div className={styles.wrapper}>
      <Loader />
      <h3 className="typography-desktop-headline-3-d">We're working on it</h3>
    </div>
  );
};
