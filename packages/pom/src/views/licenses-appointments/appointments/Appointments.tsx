import { Badge } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { default as styles } from './Appointments.module.css';
import { Appointment } from '../../../types';
import { AddAppointmentSidesheet } from './add/AddAppointmentSidesheet';
import CardSection from '../../../components/card-section/CardSection';
import PomTable from '../../../components/pom-table/PomTable';
import { AppointmentSidesheet } from './AppointmentSidesheet';
import { generateAppointments } from './__mocks';
import { getBadgeVariant } from './utils';

const tableHeaders = {
  carrier: 'Carrier',
  state: 'State',
  resident: 'Resident',
  status: 'Status',
};

const appointmentRow = (appointment: Appointment) => ({
  carrier: (
    <AppointmentSidesheet
      trigger={<span className={clsx(styles.cta)}>{appointment.carrier}</span>}
      appointment={appointment}
    />
  ),
  state: appointment.state,
  resident: appointment.resident,
  status: (
    <Badge
      variant={getBadgeVariant(appointment.status)}
      label={appointment.status}
    />
  ),
});

const expandableAppointmentRow = (
  carrier: string,
  appointments: Appointment[]
) => {
  const uniqueStates = new Set(appointments.map((app) => app.state));

  return {
    carrier: <span className={clsx(styles.cta)}>{carrier}</span>,
    state: `${uniqueStates.size} State${uniqueStates.size > 1 ? 's' : ''}`,
    resident: '',
    status: '', // Empty status for summary row
  };
};

const tableRows = (data: Appointment[]) => {
  // 1- Group appointments by carrier '{Carrier: [Appointment, ...]}'
  const grouped = data.reduce(
    (acc, appointment) => {
      const carrier = appointment.carrier;
      if (!acc[carrier]) {
        acc[carrier] = [];
      }
      acc[carrier].push(appointment);
      return acc;
    },
    {} as Record<string, Appointment[]>
  );

  // 2- Create a row for grouped appointments
  return Object.entries(grouped).map(([carrier, appointments]) => {
    if (appointments.length === 1) {
      return appointmentRow(appointments[0]);
    }

    // 3- If there are multiple appointments, create an expandable row with appointments under it
    return [
      expandableAppointmentRow(carrier, appointments),
      ...appointments.map(appointmentRow),
    ];
  });
};

const Appointments = () => {
  return (
    <CardSection title="Appointments" action={<AddAppointmentSidesheet />}>
      <PomTable
        headers={tableHeaders}
        rows={tableRows(generateAppointments())}
        emptyRowMessage="There are currently no appointments for this entity."
      />
    </CardSection>
  );
};

export default Appointments;
