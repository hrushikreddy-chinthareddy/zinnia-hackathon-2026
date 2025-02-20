import { ReactNode } from 'react';

import globalStyles from '@/app/layout.module.css';
import { Footer } from '@/components/footer/Footer';
import { MyPolicyViewLogo } from '@/components/my-policy-view-logo/MyPolicyViewLogo';

import styles from './Login.module.css';

interface Props {
  title: ReactNode;
  description: ReactNode;
  action: ReactNode;
  footer?: ReactNode;
}

export const GenericLoginPage = ({ title, description, action }: Props) => {
  return (
    <div className="main-content-wrapper">
      <div className="main-content-inner">
        <div className={globalStyles.mainContent}>
          <div className={styles.formContainer}>
            <div>
              <h1 className="mb-xl typography-mobile-headline-1-m">{title}</h1>
              <p className="typography-content-body-sm my-lg">{description}</p>
              <div>{action}</div>
            </div>
            <MyPolicyViewLogo className={styles.policyViewLogo} />
            <Footer className={`${styles.footer} py-2xl`} />
          </div>
        </div>
      </div>
    </div>
  );
};
