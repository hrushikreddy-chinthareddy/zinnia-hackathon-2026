import { toTitleCase } from '@zinnia/utils';
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

// Helper function to format enum values for corporation type and channel
// maybe this could be moved to utils/strings? not sure
export const formatEnumValue = (value: string): string => {
  // split the camelCase into separate words with spaces
  const wordsWithSpaces = value.replace(/([A-Z])/g, ' $1').trim();

  return toTitleCase(wordsWithSpaces);
};
