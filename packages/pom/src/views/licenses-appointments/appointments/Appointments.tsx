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
import { AppointmentSidesheet } from './AppointmentSidesheet';

// @TODO: move this once we properly set up data structures for pom
const appointments: Appointment[] = [
  {
    id: '1',
    carrier: 'AAA Insurance',
    state: 'CA',
    resident: 'Yes',
    status: AppointmentStatus.APPROVED,
    effectiveDate: '01/01/2023',
    company: 'PBC Health Benefits Society',
    licenseNumber: '0012149A',
    lineOfAuthorities: [
      {
        type: 'lineOfAuthority1',
        label: 'Line of Authority 1',
        status: 'Active',
        effectiveDate: '01/01/2023',
        expiryDate: '01/01/2027',
      },
      {
        type: 'lineOfAuthority2',
        label: 'Line of Authority 2',
        status: 'Active',
        effectiveDate: '01/01/2023',
        expiryDate: '01/01/2027',
      },
    ],
  },
  {
    id: '2',
    carrier: 'PBC Health Benefits Society',
    state: 'AL',
    resident: 'Yes',
    status: AppointmentStatus.PENDING,
    effectiveDate: '01/01/2023',
    company: 'PBC Health Benefits Society',
    licenseNumber: '0012149A',
    lineOfAuthorities: [
      {
        type: 'lineOfAuthority1',
        label: 'Line of Authority 1',
        status: 'Active',
        effectiveDate: '01/01/2023',
        expiryDate: '01/01/2027',
      },
      {
        type: 'lineOfAuthority2',
        label: 'Line of Authority 2',
        status: 'Active',
        effectiveDate: '01/01/2023',
        expiryDate: '01/01/2027',
      },
    ],
  },
  {
    id: '3',
    carrier: 'PBC Health Benefits Society',
    state: 'AZ',
    resident: 'Yes',
    status: AppointmentStatus.TERMINATED,
    effectiveDate: '01/01/2023',
    company: 'AAA Insurance',
    licenseNumber: '128815C',
    lineOfAuthorities: [
      {
        type: 'lineOfAuthority1',
        label: 'Line of Authority 1',
        status: 'Active',
        effectiveDate: '01/01/2023',
        expiryDate: '01/01/2027',
      },
      {
        type: 'lineOfAuthority2',
        label: 'Line of Authority 2',
        status: 'Active',
        effectiveDate: '01/01/2023',
        expiryDate: '01/01/2027',
      },
    ],
  },
  {
    id: '4',
    carrier: 'PBC Health Benefits Society',
    state: 'UT',
    resident: 'Yes',
    status: AppointmentStatus.JUST_IN_TIME,
    effectiveDate: '01/01/2023',
    company: 'PBC Health Benefits Society',
    licenseNumber: '0012149A',
    lineOfAuthorities: [
      {
        type: 'lineOfAuthority1',
        label: 'Line of Authority 1',
        status: 'Active',
        effectiveDate: '01/01/2023',
        expiryDate: '01/01/2027',
      },
      {
        type: 'lineOfAuthority2',
        label: 'Line of Authority 2',
        status: 'Active',
        effectiveDate: '01/01/2023',
        expiryDate: '01/01/2027',
      },
    ],
  },
  {
    id: '5',
    carrier: 'PBC Health Benefits Society',
    state: 'UT',
    resident: 'Yes',
    status: AppointmentStatus.JUST_IN_TIME,
    effectiveDate: '01/01/2023',
    company: 'PBC Health Benefits Society',
    licenseNumber: '0012149A',
    lineOfAuthorities: [
      {
        type: 'lineOfAuthority1',
        label: 'Line of Authority 1',
        status: 'Active',
        effectiveDate: '01/01/2023',
        expiryDate: '01/01/2027',
      },
      {
        type: 'lineOfAuthority2',
        label: 'Line of Authority 2',
        status: 'Active',
        effectiveDate: '01/01/2023',
        expiryDate: '01/01/2027',
      },
    ],
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
            <TableRow key={appointment.id}>
              <TableCell>
                <AppointmentSidesheet
                  trigger={
                    <span
                      className={clsx(
                        styles.cta,
                        'typography-nav-links-sm-inline'
                      )}
                    >
                      {appointment.carrier}
                    </span>
                  }
                  appointment={appointment}
                ></AppointmentSidesheet>
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
