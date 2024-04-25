import { Loader } from '@zinnia/bloom/internal/components';

import styles from './loading.module.css';

export default function Loading() {
  return (
    <div className="container">
      <div className={styles.loader}>
        <Loader />
      </div>
    </div>
  );
}
