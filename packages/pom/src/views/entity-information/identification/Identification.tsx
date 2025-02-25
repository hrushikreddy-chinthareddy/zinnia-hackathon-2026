import { Label } from '@zinnia/bloom/components';
import { clsx } from 'clsx';

import { ProducerType } from '../../../types';

import { default as styles } from './Identification.module.css';

export const Identification = ({
  producerType,
}: {
  producerType: ProducerType;
}) => {
  const corporationIdentificationFields = [
    { label: 'Type of corporation', value: 'General agency' },
    { label: 'Tax identification number', value: '771-23-6789' },
    { label: 'Channel', value: 'Independent marketing organization' },
  ];

  const individualIdentificationFields = [
    { label: 'Birth date', value: '1/1/2010' },
    { label: 'Social Security Number', value: '--' },
  ];

  const identificationFields = (() => {
    switch (producerType) {
      case ProducerType.CORPORATION:
        return corporationIdentificationFields;
      case ProducerType.INDIVIDUAL:
        return individualIdentificationFields;

      // @TODO: not sure if this is the right approach since i don't see an error boundary component
      // should I even check for this condition? or return []?
      // also should this be logged somewhere?
      default:
        throw new Error('Unknown producer type');
    }
  })();

  return (
    <div className="card-section">
      <h2>Identification</h2>
      <div className={clsx(styles.cardSubSectionContent)}>
        {identificationFields.map((field) => (
          <div key={field.label}>
            <Label>{field.label}</Label>
            <span>{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
