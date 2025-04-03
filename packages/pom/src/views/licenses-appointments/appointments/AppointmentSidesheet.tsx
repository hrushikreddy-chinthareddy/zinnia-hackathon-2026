import { Badge, BadgeVariant, Label } from '@zinnia/bloom/components';

import { SideSheetProps } from '@zinnia/bloom/components';
import { DEFAULT_ERROR_STRING } from '@zinnia/utils';
import { standardDateMonthDayYear, toTitleCase } from '@zinnia/utils';
import { Appointment, AppointmentStatus } from '../../../types';
import { PomSideSheet } from '../../../components/pom-sidesheet/PomSidesheet';
import { ApiAppointment } from '../../../types/get.types';
export interface AppointmentSidesheetProps
  extends Omit<SideSheetProps, 'children' | 'header'> {
  appointment: Appointment | ApiAppointment;
}

// Api can return a null value for the status
const getBadgeVariant = (
  status: AppointmentStatus | undefined
): BadgeVariant => {
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
  appointment,
  ...props
}: AppointmentSidesheetProps) => {
  return (
    <PomSideSheet
      header={appointment.licenseNumber ?? DEFAULT_ERROR_STRING}
      trigger={trigger}
      {...props}
    >
      <div className="pom_content-wrapper typography-content-body-sm">
        <div>
          <Label>Status</Label>
          <Badge
            label={appointment.status ?? DEFAULT_ERROR_STRING}
            variant={getBadgeVariant(appointment.status)}
          />
        </div>
        <div>
          <Label>Carrier</Label>
          <span>{appointment.carrier ?? DEFAULT_ERROR_STRING}</span>
        </div>
        <div>
          <Label>State</Label>
          <span>{appointment.state ?? DEFAULT_ERROR_STRING}</span>
        </div>
        <div>
          <Label>Resident</Label>
          <span>{appointment.resident ?? DEFAULT_ERROR_STRING}</span>
        </div>
        <div>
          <Label>License number</Label>
          <span>{appointment.licenseNumber ?? DEFAULT_ERROR_STRING}</span>
        </div>
        <div>
          <Label>Product company</Label>
          <span>{toTitleCase(appointment.company)}</span>
        </div>
        <div>
          {/* in the api, the line of authorities for an appointment exist as a string array, and not as a lineOfAuthorities array of object */}
          {/* this means that the api can return the same string value multiple times in the array, which is not coherant in the ui */}
          {/* for example: ['Life', 'Life'] */}
          {/* @TODO: ask product how to handle this scenario */}
          <Label>Lines of authority</Label>
          <ol className="pom_ordered-list">
            {appointment.linesOfAuthority
              ? appointment.linesOfAuthority.map(lineOfAuthority => (
                  <li
                    key={lineOfAuthority}
                    className="typography-content-body-sm"
                  >
                    {toTitleCase(lineOfAuthority)}
                  </li>
                ))
              : '--'}
          </ol>
        </div>
        <div>
          <Label>Effective date</Label>
          <span>{standardDateMonthDayYear(appointment.effectiveDate)}</span>
        </div>
      </div>
    </PomSideSheet>
  );
};
