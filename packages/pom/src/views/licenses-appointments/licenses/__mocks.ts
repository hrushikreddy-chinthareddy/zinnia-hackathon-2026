import { License } from '../../../types';

import { LicenseStatus } from '../../../types';

export const generateLicenses = (): License[] => [
  {
    number: '0012149A',
    type: 'typeA',
    state: 'CA',
    resident: 'No',
    effectiveDate: '01/01/2023',
    expiryDate: '01/01/2025',
    status: LicenseStatus.ACTIVE,
    suspensionStartDate: '01/01/2023',
    suspensionEndDate: '01/01/2023',
    expirationDate: '01/01/2023',
    inactivationReason: 'Something',
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
    number: '128815C',
    type: 'typeB',
    state: 'AZ',
    resident: 'Yes',
    effectiveDate: '01/01/2023',
    expiryDate: '01/01/2025',
    status: LicenseStatus.INACTIVE,
    suspensionStartDate: '01/01/2023',
    suspensionEndDate: '01/01/2023',
    expirationDate: '01/01/2023',
    inactivationReason: 'Something',
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
