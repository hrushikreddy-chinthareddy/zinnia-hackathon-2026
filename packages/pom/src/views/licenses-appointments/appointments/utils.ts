import { BadgeVariant } from '@zinnia/bloom/components';
import { AppointmentStatus } from '../../../types';

export const getBadgeVariant = (status?: AppointmentStatus): BadgeVariant => {
  switch (status) {
    case AppointmentStatus.PENDING:
      return BadgeVariant.PENDING;
    case AppointmentStatus.APPROVED:
      return BadgeVariant.SUCCESS;
    case AppointmentStatus.TERMINATED:
      return BadgeVariant.ERROR;
    case AppointmentStatus.JUST_IN_TIME:
      return BadgeVariant.INFO;
    default:
      return BadgeVariant.DEFAULT;
  }
};
