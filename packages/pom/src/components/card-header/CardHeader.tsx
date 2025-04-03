import { Icon, IconType } from '@zinnia/bloom/components';
import { clsx } from 'clsx';

import { default as styles } from './CardHeader.module.css';

export const CardHeader = ({
  iconType,
  title,
  subtext,
}: {
  iconType: IconType;
  title: string;
  subtext: string;
}) => {
  return (
    <div className={clsx(styles.cardHeader)}>
      <div>
        <Icon type={iconType} className={styles.icon} />
      </div>
      <div>
        <h1 className="mb-sm">{title}</h1>
        <p className="typography-content-body">{subtext}</p>
      </div>
    </div>
  );
};
