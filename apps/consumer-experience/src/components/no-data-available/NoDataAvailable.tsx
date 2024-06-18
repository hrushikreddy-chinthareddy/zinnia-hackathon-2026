import { IconType, Icon } from '@zinnia/bloom/components';
import { PropsWithChildren } from 'react';

import styles from './NoDataAvailable.module.css';

interface Props extends PropsWithChildren {
  message?: string;
  iconType?: IconType;
}

const NoDataAvailable = ({
  message = 'No data available.',
  iconType,
  children,
}: Props) => {
  return (
    <div className={`${styles.container}`}>
      <div className={`${styles.content}`}>
        {iconType && (
          <Icon
            className={styles.icon}
            type={iconType}
            width={50}
            height={50}
          />
        )}
        {!children && (
          <>
            <h3 className="typography-desktop-headline-3-d">{message}</h3>
            <p className="typography-content-body">
              Looks like there is nothing here.
            </p>
          </>
        )}
        {children}
      </div>
    </div>
  );
};

export { NoDataAvailable };
