import { Badge } from '@zinnia/bloom/components';
import { DEFAULT_ERROR_STRING } from '@zinnia/utils';
import clsx from 'clsx';
import { default as styles } from './Appointments.module.css';
import { AddAppointmentSidesheet } from './add/AddAppointmentSidesheet';
import CardSection from '../../../components/card-section/CardSection';
import PomTable from '../../../components/pom-table/PomTable';
import { AppointmentSidesheet } from './AppointmentSidesheet';
import { getBadgeVariant } from './utils';
import { getProducer } from '../../../queries/producers';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router';
import {
  ApiAppointment,
  ApiGetProducerResponse,
  MockGetProducerResponse,
} from '../../../types/get.types';
import { Appointment } from '../../../types';
import { generateMockProducer } from '../../producer/__mock';
const tableHeaders = {
  carrier: 'Carrier',
  state: 'State',
  resident: 'Resident',
  status: 'Status',
};

const appointmentRow = (appointment: ApiAppointment | Appointment) => ({
  // api doesn't return a carrier, so we can't render the sidesheet
  carrier: (
    <AppointmentSidesheet
      trigger={
        <span className={clsx(styles.cta)}>
          {appointment.carrier ?? DEFAULT_ERROR_STRING}
        </span>
      }
      appointment={appointment}
    />
  ),
  state: appointment.state,
  resident: appointment.resident,
  status: (
    <Badge
      variant={getBadgeVariant(appointment.status)}
      label={appointment.status ?? DEFAULT_ERROR_STRING}
    />
  ),
});

const expandableAppointmentRow = (
  carrier: string,
  appointments: Appointment[]
) => {
  const uniqueStates = new Set(appointments.map(app => app.state));

  return {
    carrier: <span className={clsx(styles.cta)}>{carrier}</span>,
    state: `${uniqueStates.size} State${uniqueStates.size > 1 ? 's' : ''}`,
    resident: '',
    status: '', // Empty status for summary row
  };
};

const mockTableRows = (data: Appointment[]) => {
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

const tableRows = (data: ApiAppointment[]) => {
  // // I can't group appointments by the carrier since there's no carrier for the appointment returned by the API
  // // @TODO: rework this once the API spec is fixed
  return data.map(appointmentRow);
};

const Appointments = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isMockFromUrl = searchParams.get('isMock') === 'true';

  const { data: queryData } = useQuery({
    queryKey: ['producer', id],
    queryFn: () => getProducer(id ?? ''),
  });

  const data: ApiGetProducerResponse | MockGetProducerResponse | undefined =
    isMockFromUrl ? generateMockProducer(id ?? '') : queryData;

  // If we're not mocking and there's no data returned by the query
  if (!isMockFromUrl && !data) {
    return (
      <CardSection title="Appointments">
        <PomTable
          headers={tableHeaders}
          rows={[]}
          emptyRowMessage="There are currently no appointments for this entity."
        />
      </CardSection>
    );
  }

  const appointmentRows = isMockFromUrl
    ? mockTableRows(data?.licensesAndAppointments.appointments as Appointment[])
    : tableRows(data?.licensesAndAppointments.appointments as ApiAppointment[]);

  return (
    <CardSection title="Appointments" action={<AddAppointmentSidesheet />}>
      <PomTable
        headers={tableHeaders}
        rows={appointmentRows ?? []}
        emptyRowMessage="There are currently no appointments for this entity."
      />
    </CardSection>
  );
};

export default Appointments;
