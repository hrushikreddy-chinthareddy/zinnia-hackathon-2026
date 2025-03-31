import { Appointment } from '../../../types';

import { AppointmentStatus } from '../../../types';

// @TODO: move this once we properly set up data structures for pom
export const generateAppointments = (): Appointment[] => [
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
    company: 'PBC Health Benefits Society',
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
    carrier: 'AAA Insurance',
    state: 'UT',
    resident: 'Yes',
    status: AppointmentStatus.JUST_IN_TIME,
    effectiveDate: '01/01/2023',
    company: 'AAA Insurance',
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
    id: '6',
    carrier: 'Acme Insurance',
    state: 'UT',
    resident: 'Yes',
    status: AppointmentStatus.TERMINATED,
    effectiveDate: '01/01/2023',
    company: 'Acme Insurance',
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

export const groupedAppointments = generateAppointments().reduce(
  (grouped, appointment) => {
    const company = appointment.company;
    if (!grouped[company]) {
      grouped[company] = [];
    }
    grouped[company].push(appointment);
    return grouped;
  },
  {} as Record<string, Appointment[]>
);
