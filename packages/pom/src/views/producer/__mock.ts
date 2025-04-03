import {
  AddressType,
  Channel,
  CorporationType,
  LicensesAndAppointmentsStatus,
  PhoneNumberType,
  ProducerType,
} from '../../types';
import {
  ApiGetProducerResponse,
  MockGetProducerResponse,
} from '../../types/get.types';
import { generateBackgroundChecks } from '../entity-information/background-checks/__mocks';
import { generateAppointments } from '../licenses-appointments/appointments/__mocks';
import { generateLicenses } from '../licenses-appointments/licenses/__mocks';
import {
  generateAmlTraining,
  generateProductTraining,
  generateStateTraining,
} from '../training-education/__mocks';

export const generateMockProducer = (id: string): MockGetProducerResponse => {
  return {
    producerType: ProducerType.INDIVIDUAL,
    firstName: 'MockP',
    lastName: 'Roducer',
    middleName: 'Robert',
    fullName: 'Acme Insurance Agency Inc.',
    dateOfBirth: '1980-05-15',
    socialSecurityNumber: '123-45-6789',
    nationalProducerNumber: id || '1234566',
    taxPayerIdentificationNumber: '12-3456789',
    email: 'john.smith@acmeinsurance.com',
    trainings: {
      amlTrainings: generateAmlTraining(1),
      productTrainings: generateProductTraining(),
      stateTrainings: generateStateTraining(6),
    },
    phoneNumbers: [
      {
        countryCode: '+1',
        number: '555-123-4567',
        extension: '123',
        type: PhoneNumberType.PRIMARY,
      },
    ],
    addresses: [
      {
        type: AddressType.RESIDENTIAL,
        line: '123 Main Street',
        line2: 'Suite 200',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        zipCode: '60601',
      },
    ],

    backgroundChecks: generateBackgroundChecks(),
    agencyType: CorporationType.GENERAL_AGENCY,
    channel: Channel.INDEPENDENT_PLANNERS,
    licensesAndAppointments: {
      status: LicensesAndAppointmentsStatus.PENDING_VERTAFORE_CREATION,
      licenses: generateLicenses(),
      appointments: generateAppointments(),
    },
  };
};

export const generateMockApiProducer = (id: string): ApiGetProducerResponse => {
  console.log(id);
  return {
    producerType: ProducerType.INDIVIDUAL,
    firstName: 'Test',
    lastName: 'Harriet',
    dateOfBirth: '2025-01-01',
    caseId: 'ea40b60e-6e00-463f-9a9e-12da40b499d3',
    nationalProducerNumber: '88888888',
    email: 'test@example.com',
    addresses: [],
    backgroundChecks: [],
    hasLatestLicensesAndAppointments: false,
    agencyType: 'GeneralAgency',
    channel: 'IndependentPlanners',
    licensesAndAppointments: {
      licenses: [],
      appointments: [],
    },
    carrierShortNames: ['WELB', 'SBGC', 'GLCO'],
  };
};

// This is for testing, since we don't have an agent returned by the API that as data
// export const generateMockApiProducer = (id: string): ApiGetProducerResponse => {
//   return {
//     producerType: ProducerType.INDIVIDUAL,
//     firstName: 'John',
//     lastName: 'Smith',
//     middleName: 'Robert',
//     fullName: 'Acme Insurance Agency Inc.',
//     caseId: 'CA-2023-1234',
//     dateOfBirth: '1980-05-15',
//     socialSecurityNumber: '123-45-6789',
//     nationalProducerNumber: id || '1234566',
//     taxPayerIdentificationNumber: '12-3456789',
//     email: 'john.smith@acmeinsurance.com',
//     phoneNumbers: [
//       {
//         countryCode: '+1',
//         number: '555-123-4567',
//         extension: '123',
//         type: PhoneNumberType.PRIMARY,
//       },
//     ],
//     addresses: [
//       {
//         type: AddressType.RESIDENTIAL,
//         line: '123 Main Street',
//         line2: 'Suite 200',
//         city: 'Chicago',
//         state: 'IL',
//         country: 'USA',
//         zipCode: '60601',
//         effectiveDates: {
//           startDate: '2020-01-01',
//           endDate: '2025-12-31',
//           isCurrent: true,
//         },
//       },
//     ],
//     employers: [
//       {
//         name: 'Acme Insurance Agency Inc.',
//         address: {
//           type: AddressType.BUSINESS,
//           line: '456 Corporate Drive',
//           line2: 'Floor 15',
//           city: 'Chicago',
//           state: 'IL',
//           country: 'USA',
//           zipCode: '60602',
//           effectiveDates: {
//             startDate: '2020-01-01',
//             endDate: '2025-12-31',
//             isCurrent: true,
//           },
//         },
//         jobTitle: 'Senior Insurance Agent',
//         effectiveDates: {
//           startDate: '2020-01-01',
//           endDate: '2025-12-31',
//           isCurrent: true,
//         },
//         contactInfo: {
//           phoneNumber: {
//             countryCode: '+1',
//             number: '555-987-6543',
//             extension: '456',
//             type: PhoneNumberType.PRIMARY,
//           },
//           contactPerson: {
//             firstName: 'Jane',
//             lastName: 'Wilson',
//           },
//           email: 'jwilson@acmeinsurance.com',
//           postalAddress: {
//             type: AddressType.BUSINESS,
//             line: '456 Corporate Drive',
//             line2: 'Floor 15',
//             city: 'Chicago',
//             state: 'IL',
//             country: 'USA',
//             zipCode: '60602',
//             effectiveDates: {
//               startDate: '2020-01-01',
//               endDate: '2025-12-31',
//               isCurrent: true,
//             },
//           },
//         },
//       },
//     ],
//     backgroundChecks: [
//       {
//         // the provider is missing from the API
//         requestId: 'BGC-2023-789',
//         // the statuses returned by the API do NOT match the statuses in the UI
//         status: ApiBackgroundCheckStatus.PENDING,
//         adjudication: {
//           result: ApiBackgroundCheckAdjudicationResult.PASS,
//           carrierResult: ApiBackgroundCheckAdjudicationCarrierResult.APPROVED,
//         },
//         requestDate: '2024-01-01',
//         completionDate: '2024-01-01',
//         carrierShortName: 'Acme',
//       },
//       {
//         // the provider is missing from the API
//         requestId: 'BGC-2023-789',
//         // the statuses returned by the API do NOT match the statuses in the UI
//         status: ApiBackgroundCheckStatus.CANCELLED,
//         adjudication: {
//           result: ApiBackgroundCheckAdjudicationResult.PASS,
//           carrierResult: ApiBackgroundCheckAdjudicationCarrierResult.APPROVED,
//         },
//         requestDate: '2024-01-01',
//         completionDate: '2024-01-01',
//         carrierShortName: 'AAA Insurance',
//       },
//       {
//         // the provider is missing from the API
//         requestId: 'BGC-2023-789',
//         // the statuses returned by the API do NOT match the statuses in the UI
//         status: ApiBackgroundCheckStatus.COMPLETED,
//         adjudication: {
//           result: ApiBackgroundCheckAdjudicationResult.PASS,
//           carrierResult: ApiBackgroundCheckAdjudicationCarrierResult.APPROVED,
//         },
//         requestDate: '2024-01-01',
//         completionDate: '2024-01-01',
//         carrierShortName: 'Primerica',
//       },
//       {
//         // the provider is missing from the API
//         requestId: 'BGC-2023-789',
//         // the statuses returned by the API do NOT match the statuses in the UI
//         status: ApiBackgroundCheckStatus.ERROR,
//         adjudication: {
//           result: ApiBackgroundCheckAdjudicationResult.PASS,
//           carrierResult: ApiBackgroundCheckAdjudicationCarrierResult.APPROVED,
//         },
//         requestDate: '2024-01-01',
//         completionDate: '2024-01-01',
//         carrierShortName: 'Check Inc.',
//       },
//     ],
//     hasLatestLicensesAndAppointments: false,
//     agencyType: CorporationType.GENERAL_AGENCY,
//     channel: Channel.INDEPENDENT_PLANNERS,
//     licensesAndAppointments: {
//       status: LicensesAndAppointmentsStatus.PENDING_VERTAFORE_CREATION,
//       licenses: [
//         {
//           type: 'Life and Health',
//           state: 'Illinois',
//           residentState: false,
//           // this is a string in the api
//           status: LicenseStatus.ACTIVE,
//           statusDate: '2023-01-01',
//           effectiveDate: '2023-01-01',
//           expirationDate: '2025-12-31',
//           number: 'IL-123456',
//           inactivationReason: 'Not Applicable',
//           suspensionStartDate: '2023-06-01',
//           suspensionEndDate: '2023-06-30',
//           lineOfAuthorities: [
//             {
//               type: 'Life Insurance',
//               state: 'Illinois',
//               status: 'Active',
//               statusDate: '2023-01-01',
//               issueDate: '2023-01-01',
//               expirationDate: '2025-12-31',
//               inactivationReason: 'Not Applicable',
//             },
//           ],
//         },
//       ],
//       appointments: [
//         {
//           id: 'APP-2023-456',
//           state: 'Illinois',
//           type: 'Life Insurance',
//           effectiveDate: '2023-02-01',
//           status: AppointmentStatus.APPROVED,
//           company: 'Global Insurance Co.',
//           licenseType: 'Life and Health',
//           licenseCategory: 'Producer',
//           stateProducerNumber: 'IL-123456',
//           residentCountyCode: 'COOK',
//           counties: [],
//           terminationReason: 'Not Applicable',
//           resident: false,
//           licenseNumber: '1234',
//           linesOfAuthority: [LineOfAuthorityType.LIFE],
//         },
//       ],
//     },
//     carrierShortNames: ['ACME', 'GIC', 'PRI'],
//   };
// };
