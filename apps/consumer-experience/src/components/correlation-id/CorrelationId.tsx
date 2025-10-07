import clsx from 'clsx';
import { FC } from 'react';

import styles from './CorrelationId.module.css';
interface CorrelationIdProps {
  id?: string;
}

export const CorrelationId: FC<CorrelationIdProps> = ({ id }) => {
  return (
    <>
      <p
        className={clsx(
          styles.corroDetails,
          'typography-content-caption-selected text-center'
        )}
      >
        Correlation ID:
      </p>
      <p
        className={clsx(
          styles.corroDetails,
          'typography-content-captiontext-center'
        )}
      >
        {id}
      </p>
    </>
  );
};
