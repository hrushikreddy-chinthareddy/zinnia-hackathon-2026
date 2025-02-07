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
import { License, LicenseStatus } from '../../../types/types';
import clsx from 'clsx';
import { default as styles } from './Licenses.module.css';

// @TODO: move this once we properly set up data structures for pom
const licenses: License[] = [
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
const Licenses = () => {
  const getBadgeVariant = (status: LicenseStatus): BadgeVariant => {
    switch (status) {
      case LicenseStatus.ACTIVE:
        return BadgeVariant.SUCCESS;
      case LicenseStatus.INACTIVE:
        return BadgeVariant.ERROR;
      default:
        return BadgeVariant.DEFAULT;
    }
  };

  return (
    <div className="card-section">
      <h2>Licenses</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell className="typography-content-body-sm-bold">
              License Number
            </TableHeaderCell>
            <TableHeaderCell className="typography-content-body-sm-bold">
              State
            </TableHeaderCell>
            <TableHeaderCell className="typography-content-body-sm-bold">
              Resident
            </TableHeaderCell>
            <TableHeaderCell className="typography-content-body-sm-bold">
              Effective Date
            </TableHeaderCell>
            <TableHeaderCell className="typography-content-body-sm-bold">
              Expiry Date
            </TableHeaderCell>
            <TableHeaderCell className="typography-content-body-sm-bold">
              Status
            </TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {licenses.map((license) => (
            <TableRow key={license.number}>
              <TableCell>
                <span
                  className={clsx(styles.cta, 'typography-nav-links-sm-inline')}
                >
                  {license.number}
                </span>
              </TableCell>
              <TableCell>{license.state}</TableCell>
              <TableCell>{license.resident}</TableCell>
              <TableCell>{license.effectiveDate}</TableCell>
              <TableCell>{license.expiryDate}</TableCell>
              <TableCell>
                <Badge
                  variant={getBadgeVariant(license.status)}
                  label={license.status}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Licenses;
