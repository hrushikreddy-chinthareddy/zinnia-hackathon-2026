import { FC } from 'react';
import { Button } from '@zinnia/bloom/components';

import { default as styles } from './ConfirmStep.module.css';
interface ConfirmationStepProps {
  closeCallback: () => void;
  title: string;
  message: string;
}

export const ConfirmStep: FC<ConfirmationStepProps> = ({
  closeCallback,
  title,
  message,
}) => {
  return (
    <div className={`pom_content-wrapper ${styles.wrapper}`}>
      <h3>{title}</h3>
      <span>{message}</span>
      <Button size="small" onClick={closeCallback}>
        Close
      </Button>
    </div>
  );
};
