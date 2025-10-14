import { IconType, Icon } from '@zinnia/bloom/components';
import { PropsWithChildren } from 'react';

import styles from './NoDataAvailable.module.css';
import { CorrelationId } from '../correlation-id/CorrelationId';

interface Props extends PropsWithChildren {
  message?: string;
  iconType?: IconType;
  correlationId: string | undefined;
}

const NoDataAvailable = ({
  message = 'No data available.',
  iconType,
  correlationId,
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
            {message && (
              <h3 className="typography-desktop-headline-3-d">{message}</h3>
            )}
            <p className="typography-content-body">
              Looks like there is nothing here.
            </p>
            <CorrelationId id={correlationId} />
          </>
        )}
        {children}
      </div>
    </div>
  );
};

export { NoDataAvailable };
