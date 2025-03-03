import { Badge, BadgeVariant } from '@zinnia/bloom/components';
import { License, LicenseStatus } from '../../../types';
import clsx from 'clsx';
import { default as styles } from './Licenses.module.css';
import { LicenseSidesheet } from './LicenseSidesheet';
import CardSection from '../../../components/card-section/CardSection';
import PomTable from '../../../components/pom-table/PomTable';
import { generateLicenses } from './__mocks';

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

const tableHeaders = {
  number: 'Number',
  state: 'State',
  resident: 'Resident',
  effectiveDate: 'Effective Date',
  expirationDate: 'Expiration Date',
  status: 'Status',
};

const tableRows = (licenses: License[]) =>
  licenses.map((license) => ({
    number: (
      <LicenseSidesheet
        trigger={<span className={clsx(styles.cta)}>{license.number}</span>}
        license={license}
      ></LicenseSidesheet>
    ),
    state: license.state,
    resident: license.resident,
    effectiveDate: license.effectiveDate,
    expirationDate: license.expirationDate,
    status: (
      <Badge variant={getBadgeVariant(license.status)} label={license.status} />
    ),
  }));

const Licenses = () => {
  return (
    <CardSection title="Licenses">
      <PomTable
        headers={tableHeaders}
        rows={tableRows(generateLicenses())}
        emptyRowMessage="There are currently no licenses for this entity/"
      />
    </CardSection>
  );
};

export default Licenses;
