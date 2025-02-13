import { Badge, BadgeVariant } from '@zinnia/bloom/components';
import { Appointment, AppointmentStatus } from '../../../types';
import CardSection from '../../../components/card-section/CardSection';
import PomTable from '../../../components/pom-table/PomTable';
import { AppointmentSidesheet } from './AppointmentSidesheet';
import clsx from 'clsx';
import { default as styles } from './Appointments.module.css';
import { generateAppointments } from './__mocks';
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

const tableHeaders = {
  carrier: 'Carrier',
  state: 'State',
  resident: 'Resident',
  status: 'Status',
};

const tableRows = (data: Appointment[]) =>
  data.map((appointment) => ({
    carrier: (
      <AppointmentSidesheet
        trigger={
          <span className={clsx(styles.cta)}>{appointment.carrier}</span>
        }
        appointment={appointment}
      ></AppointmentSidesheet>
    ),
    state: appointment.state,
    resident: appointment.resident,
    status: (
      <Badge
        variant={getBadgeVariant(appointment.status)}
        label={appointment.status}
      />
    ),
  }));

const Appointments = () => {
  return (
    <CardSection title="Appointments">
      <PomTable
        headers={tableHeaders}
        rows={tableRows(generateAppointments())}
        emptyRowMessage="There are currently no appointments for this entity."
      />
    </CardSection>
  );
};

export default Appointments;
