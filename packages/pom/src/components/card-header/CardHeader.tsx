import { Icon, IconType } from '@zinnia/bloom/components';
import { clsx } from 'clsx';

import { ProducerType } from '../../types/types';

import { default as styles } from './CardHeader.module.css';

export const CardHeader = ({
  producerType,
  id,
}: {
  producerType: ProducerType;
  id?: string;
}) => {
  // @TODO: this will change once we integrate with the api
  const { iconType, title, subtext } =
    producerType === ProducerType.CORPORATION
      ? {
          iconType: IconType.OFFICEBUILDING,
          title: 'Acme Corporation',
          subtext: 'National producer number: 821694063',
        }
      : {
          iconType: IconType.USER,
          title: 'Ethan Conners',
          subtext: 'National producer number: 987654321',
        };
  return (
    <div className={clsx(styles.cardHeader)}>
      <div>
        <Icon type={iconType} className={styles.icon} />
      </div>
      <div>
        <h1 className="mb-sm">
          {title} {id}
        </h1>
        <p className="typography-content-body">{subtext}</p>
      </div>
    </div>
  );
};
