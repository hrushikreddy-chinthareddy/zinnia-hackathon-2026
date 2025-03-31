import { ProducerType } from '../../types';

export type HierarchyEntry = {
  lookupId: string;
  level: string;
};

export type ProducerFormData = {
  recordType: ProducerType;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  nationalProducerNumber: number;
  dateOfBirth?: string;
  email: string;
  corporationType?: string;
  channel?: string;
  carrier: string;
  hierarchy: {
    producerLookupId: string;
    level: string;
    effectiveDate: string;
    uplineProducersInformation: HierarchyEntry[];
  };
};
