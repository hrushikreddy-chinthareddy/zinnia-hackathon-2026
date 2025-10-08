'use client';

import clsx from 'clsx';
import { FC, useEffect } from 'react';

import styles from './CorrelationId.module.css';
interface CorrelationIdProps {
  id?: string;
}

export const CorrelationId: FC<CorrelationIdProps> = ({ id }) => {
  // Trigger mouseflow event when component mounts
  useEffect(() => {
    if (id) {
      window._mfq.push(['tag', `correlationId shown: ${id}`]);
    }
  }, [id]);

  return (
    <p className={clsx(styles.corroDetails, 'typography-content-caption')}>
      {id}
    </p>
  );
};
