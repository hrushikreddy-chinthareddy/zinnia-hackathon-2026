import { ReactNode } from 'react';
import globalStyles from '@/app/layout.module.css';
import styles from './Login.module.css';

interface Props {
  title: ReactNode;
  description: ReactNode;
  action: ReactNode;
  footer?: ReactNode;
}

export const GenericLoginPage = ({
  title,
  description,
  action,
  footer,
}: Props) => {
  return (
    <div className={styles.main}>
      <div className={globalStyles.container}>
        <div className={globalStyles.content}>
          <div className={styles.formContainer}>
            <div>
              <h1>{title}</h1>
              <p className="typography-content-body mb-lg">{description}</p>
              <div>{action}</div>
            </div>
            {footer && (
              <div className={`typography-content-footer-legal`}>{footer}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
