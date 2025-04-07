import { PropsWithChildren } from 'react';

import styles from './Layout.module.css';

export const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className={styles.container}>
      <h1>Cool Layout Bro</h1>
      <main className={styles.main}>{children}</main>
    </div>
  );
};
