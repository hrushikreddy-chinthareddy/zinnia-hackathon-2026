import styles from './AssistiveText.module.css';
import { Icon, IconType } from '../icon';
import { AssistiveTextProps, AssistiveTextVariant } from './types';

const AssistiveIcon = {
  [AssistiveTextVariant.Default]: IconType.MAIL,
  [AssistiveTextVariant.Success]: IconType.CIRCLE_CHECKMARK,
  [AssistiveTextVariant.Info]: IconType.ALERT_EXCLAMATION,
  [AssistiveTextVariant.Error]: IconType.HEX_EXCLAMATION,
};

export const AssistiveText: React.FC<AssistiveTextProps> = ({
  text,
  variant = AssistiveTextVariant.Default,
}: AssistiveTextProps) => {
  if (!text) {
    return null;
  }

  const variantClass = () => {
    switch (variant) {
      case AssistiveTextVariant.Success:
        return styles.success;
      case AssistiveTextVariant.Info:
        return styles.info;
      case AssistiveTextVariant.Error:
        return styles.error;
      default:
        return styles.default;
    }
  };

  return (
    <div className={`${styles.assistiveText} ${variantClass()}`}>
      <div>
        <Icon type={AssistiveIcon[variant]} small />
      </div>
      <p className="typography-content-caption-selected">{text}</p>
    </div>
  );
};
