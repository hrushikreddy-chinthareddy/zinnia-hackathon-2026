import { IconType, Icon } from '@zinnia/bloom/internal/components';
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
        {iconType && <Icon type={iconType} width={50} height={50} />}
        {!children && <p>{message}</p>}
        {children}
      </div>
    </div>
  );
};

export { NoDataAvailable };
