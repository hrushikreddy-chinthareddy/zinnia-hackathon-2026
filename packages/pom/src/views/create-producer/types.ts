import { ProducerType } from '../../types';

export type ProducerFormData = {
  recordType: ProducerType;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  nationalProducerNumber?: string;
  dateOfBirth?: string;
  email?: string;
  corporationType?: string;
  channel?: string;
};
