import {
  Badge,
  BadgeVariant,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { default as styles } from './Appointments.module.css';
import { Appointment, AppointmentStatus } from '../../../types/types';

// @TODO: move this once we properly set up data structures for pom
const appointments: Appointment[] = [
  {
    carrier: 'AAA Insurance',
    state: 'CA',
    resident: 'Yes',
    status: AppointmentStatus.APPROVED,
    effectiveDate: '01/01/2023',
    company: 'PBC Health Benefits Society',
    licenseNumber: '0012149A',
  },
  {
    carrier: 'PBC Health Benefits Society',
    state: 'AL',
    resident: 'Yes',
    status: AppointmentStatus.PENDING,
    effectiveDate: '01/01/2023',
    company: 'PBC Health Benefits Society',
    licenseNumber: '0012149A',
  },
  {
    carrier: 'PBC Health Benefits Society',
    state: 'AZ',
    resident: 'Yes',
    status: AppointmentStatus.TERMINATED,
    effectiveDate: '01/01/2023',
    company: 'AAA Insurance',
    licenseNumber: '128815C',
  },
  {
    carrier: 'PBC Health Benefits Society',
    state: 'UT',
    resident: 'Yes',
    status: AppointmentStatus.JUST_IN_TIME,
    effectiveDate: '01/01/2023',
    company: 'PBC Health Benefits Society',
    licenseNumber: '0012149A',
  },
  {
    carrier: 'PBC Health Benefits Society',
    state: 'UT',
    resident: 'Yes',
    status: AppointmentStatus.JUST_IN_TIME,
    effectiveDate: '01/01/2023',
    company: 'PBC Health Benefits Society',
    licenseNumber: '0012149A',
  },
];

const Appointments = () => {
  const getBadgeVariant = (status: AppointmentStatus): BadgeVariant => {
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

  return (
    <div className="card-section">
      <h2>Appointments</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell className="typography-content-body-sm-bold">
              Carrier
            </TableHeaderCell>
            <TableHeaderCell className="typography-content-body-sm-bold">
              State
            </TableHeaderCell>
            <TableHeaderCell className="typography-content-body-sm-bold">
              Resident
            </TableHeaderCell>
            <TableHeaderCell className="typography-content-body-sm-bold">
              Status
            </TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.carrier}>
              <TableCell>
                <span
                  className={clsx(styles.cta, 'typography-nav-links-sm-inline')}
                >
                  {appointment.carrier}
                </span>
              </TableCell>
              <TableCell>{appointment.state}</TableCell>
              <TableCell>{appointment.resident}</TableCell>
              <TableCell>
                <Badge
                  variant={getBadgeVariant(appointment.status)}
                  label={appointment.status}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Appointments;
