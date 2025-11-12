import { TagVariant } from '@zinnia/bloom/components';

export const getAuthorizationTagStatus = (
  authorizationStatus: string
): TagVariant => {
  //TODO: replace with enum if the API ships one
  switch (authorizationStatus) {
    case 'Need Approval':
      return TagVariant.Pending;
    default:
      return TagVariant.Default;
  }
};
