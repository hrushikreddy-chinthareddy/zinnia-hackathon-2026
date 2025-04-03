import { Badge, BadgeVariant } from '@zinnia/bloom/components';
import { License, LicenseStatus } from '../../../types';
import clsx from 'clsx';
import { default as styles } from './Licenses.module.css';
import { LicenseSidesheet } from './LicenseSidesheet';
import CardSection from '../../../components/card-section/CardSection';
import PomTable from '../../../components/pom-table/PomTable';
import { getProducer } from '../../../queries/producers';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router';
import {
  ApiGetProducerResponse,
  ApiLicense,
  MockGetProducerResponse,
} from '../../../types/get.types';
import { generateMockProducer } from '../../producer/__mock';

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

const mockTableRows = (licenses: License[]) =>
  licenses.map(license => ({
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

const tableRows = (licenses: ApiLicense[]) =>
  licenses.map(license => ({
    number: (
      <LicenseSidesheet
        trigger={<span className={clsx(styles.cta)}>{license.number}</span>}
        license={license}
      ></LicenseSidesheet>
    ),
    state: license.state,
    // missing boolean field from the api
    resident: '--',
    effectiveDate: license.effectiveDate,
    expirationDate: license.expirationDate,
    // api field can be null
    status: license.status ? (
      <Badge variant={getBadgeVariant(license.status)} label={license.status} />
    ) : (
      '--'
    ),
  }));

const Licenses = () => {
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
      <CardSection title="Licenses">
        <PomTable
          headers={tableHeaders}
          rows={[]}
          emptyRowMessage="There are currently no licenses for this entity."
        />
      </CardSection>
    );
  }

  const licenseRows = isMockFromUrl
    ? mockTableRows(data?.licensesAndAppointments.licenses as License[])
    : tableRows(data?.licensesAndAppointments.licenses as ApiLicense[]);

  return (
    <CardSection title="Licenses">
      <PomTable
        headers={tableHeaders}
        rows={licenseRows ?? []}
        emptyRowMessage="There are currently no licenses for this entity."
      />
    </CardSection>
  );
};

export default Licenses;
