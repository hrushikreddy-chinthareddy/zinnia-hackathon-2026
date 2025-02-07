import { Badge, BadgeVariant, Label } from '@zinnia/bloom/components';

import { SideSheetProps } from '@zinnia/bloom/components';

import { SideSheet } from '@zinnia/bloom/components';

import { standardDateMonthDayYear, toTitleCase } from '@zinnia/utils';
import {
  Appointment,
  AppointmentStatus,
  LineOfAuthority,
} from '../../../types/types';
export interface AppointmentSidesheetProps
  extends Omit<SideSheetProps, 'children' | 'header'> {
  data: {
    appointment: Appointment;
    lineOfAuthorities: LineOfAuthority[];
  };
}

const getBadgeVariant = (status: AppointmentStatus): BadgeVariant => {
  switch (status) {
    case AppointmentStatus.APPROVED:
      return BadgeVariant.SUCCESS;
    case AppointmentStatus.TERMINATED:
      return BadgeVariant.ERROR;
    case AppointmentStatus.PENDING:
      return BadgeVariant.PENDING;
    default:
      return BadgeVariant.DEFAULT;
  }
};

export const AppointmentSidesheet = ({
  trigger,
  data,
  ...props
}: AppointmentSidesheetProps) => {
  const { appointment, lineOfAuthorities } = data;
  return (
    <SideSheet header={appointment.licenseNumber} trigger={trigger} {...props}>
      <div className="pom_content-wrapper">
        <div>
          <Label>Status</Label>
          <Badge
            label={appointment.status}
            variant={getBadgeVariant(appointment.status)}
          />
        </div>
        <div>
          <Label>Carrier</Label>
          <span>{appointment.carrier}</span>
        </div>
        <div>
          <Label>State</Label>
          <span>{appointment.state}</span>
        </div>
        <div>
          <Label>Resident</Label>
          <span>{appointment.resident}</span>
        </div>
        <div>
          <Label>License number</Label>
          <span>{appointment.licenseNumber}</span>
        </div>
        <div>
          <Label>Product company</Label>
          <span>{toTitleCase(appointment.company)}</span>
        </div>
        <div>
          <Label>Lines of authority</Label>
          <ol className="pom_ordered-list">
            {lineOfAuthorities.map((lineOfAuthority) => (
              <li
                key={lineOfAuthority.type}
                className="typography-content-body-sm"
              >
                {toTitleCase(lineOfAuthority.label)}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <Label>Effective date</Label>
          <span>{standardDateMonthDayYear(appointment.effectiveDate)}</span>
        </div>
      </div>
    </SideSheet>
  );
};
