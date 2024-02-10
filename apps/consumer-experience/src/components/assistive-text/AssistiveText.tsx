import clsx from 'clsx';

import styles from './AssistiveText.module.css';
import { Icon, IconType } from '../icon/Icon';

export enum AssistiveTextVariant {
  Default = 'default',
  Success = 'success',
  Info = 'info',
  Error = 'error',
}

export interface AssistiveTextProps {
  text: string;
  variant: AssistiveTextVariant;
}

const AssistiveIcon = {
  [AssistiveTextVariant.Default]: IconType.MAIL,
  [AssistiveTextVariant.Success]: IconType.CIRCLE_CHECKMARK,
  [AssistiveTextVariant.Info]: IconType.ALERT_EXCLAMATION,
  [AssistiveTextVariant.Error]: IconType.HEX_EXCLAMATION,
};

export const AssistiveText = ({
  text,
  variant = AssistiveTextVariant.Default,
}: AssistiveTextProps) => {
  const variantClass = clsx({
    [styles.success]: variant === AssistiveTextVariant.Success,
    [styles.info]: variant === AssistiveTextVariant.Info,
    [styles.error]: variant === AssistiveTextVariant.Error,
  });

  return (
    <div className={`${styles.assistiveText} ${variantClass}`}>
      <Icon type={AssistiveIcon[variant]} small />
      <p className="typography-content-caption-selected">{text}</p>
    </div>
  );
};
