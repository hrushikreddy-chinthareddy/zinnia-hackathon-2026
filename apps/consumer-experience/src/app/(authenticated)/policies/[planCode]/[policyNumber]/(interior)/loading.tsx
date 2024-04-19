import { Loader, LoaderVariant } from '@zinnia/bloom/internal/components';

import styles from './loading.module.css';

export default function Loading() {
  return (
    <div className="container">
      <div
        style={{
          height: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Loader />
      </div>
      {/* <div className={`${styles.skeleton} ${styles.header}`}></div>
      <div className={styles.headerDetails}>
        <div className={styles.skeleton}></div>
        <div className={styles.skeleton}></div>
        <div className={styles.skeleton}></div>
        <div className={styles.skeleton}></div>
      </div>
      <div className={`${styles.skeleton} ${styles.body}`}></div> */}
    </div>
  );
}
