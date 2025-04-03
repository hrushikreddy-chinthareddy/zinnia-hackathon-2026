import {
  AssistiveText,
  AssistiveTextVariant,
  Badge,
  BadgeVariant,
} from '@zinnia/bloom/components';
import CardSection from '../../../components/card-section/CardSection';
import {
  ApiBackgroundCheckStatus,
  BackgroundCheck,
  BackgroundCheckStatus,
} from '../../../types';
import PomTable from '../../../components/pom-table/PomTable';
import { getProducer } from '../../../queries/producers';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router';
import {
  ApiBackgroundCheck,
  ApiGetProducerResponse,
  MockGetProducerResponse,
} from '../../../types/get.types';
import { generateMockProducer } from '../../producer/__mock';
import { DEFAULT_ERROR_STRING } from '@zinnia/utils';

// Unfortunately the api doesn't return statuses that map to what the UI expects:
// - there are missing statuses that the UI needs to display but are never returned by the API (example: in progress)
// - there are statuses returned by the API that may or may not map to what the UI expects
// - I tried to guess what api status would map to which badge variant as best as I could
// @TODO: rework this once the API spec is fixed
const getBadgeVariant = (
  status: BackgroundCheckStatus | ApiBackgroundCheckStatus
): BadgeVariant => {
  switch (status) {
    case BackgroundCheckStatus.IN_PROGRESS:
      return BadgeVariant.INFO;
    case BackgroundCheckStatus.APPROVED:
    case ApiBackgroundCheckStatus.COMPLETED:
      return BadgeVariant.SUCCESS;
    case BackgroundCheckStatus.UNDER_REVIEW:
    case ApiBackgroundCheckStatus.PENDING:
      return BadgeVariant.PENDING;
    case BackgroundCheckStatus.DENIED:
    case ApiBackgroundCheckStatus.ERROR:
    case ApiBackgroundCheckStatus.CANCELLED:
      return BadgeVariant.ERROR;

    default:
      return BadgeVariant.DEFAULT;
  }
};

const tableHeaders = {
  carrier: 'Carrier',
  dateRequested: 'Date requested',
  provider: 'Provider',
  resultDate: 'Result date',
  status: 'Status',
};

// generates table rows for mock background checks that can be displayed to the ui
// @TODO: remove this once api spec is fixed
const mockTableRows = (backgroundChecks: BackgroundCheck[]) =>
  backgroundChecks.map(backgroundCheck => ({
    carrier: backgroundCheck.carrier,
    dateRequested: backgroundCheck.dateRequested,
    provider: backgroundCheck.provider,
    resultDate: backgroundCheck.resultDate,
    status:
      // For some reason this status is shown as AssistiveText
      backgroundCheck.status === BackgroundCheckStatus.CANT_COMPLETE ? (
        <AssistiveText
          variant={AssistiveTextVariant.Error}
          text="Unable to complete"
        />
      ) : (
        <Badge
          variant={getBadgeVariant(backgroundCheck.status)}
          label={backgroundCheck.status}
        />
      ),
  }));

// generates table rows for background checks returned by the api
const tableRows = (backgroundChecks: ApiBackgroundCheck[]) =>
  backgroundChecks.map(backgroundCheck => ({
    carrier: backgroundCheck.carrierShortName ?? DEFAULT_ERROR_STRING,
    dateRequested: backgroundCheck.requestDate ?? DEFAULT_ERROR_STRING,
    // provider field not returned by the api
    provider: '--',
    resultDate: backgroundCheck.completionDate ?? DEFAULT_ERROR_STRING,
    status: (
      <Badge
        variant={getBadgeVariant(backgroundCheck.status)}
        label={backgroundCheck.status}
      />
    ),
  }));

export const BackgroundChecks = () => {
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
      <CardSection title="Background Checks">
        <PomTable
          headers={tableHeaders}
          rows={[]}
          emptyRowMessage="There are currently no background checks for this entity."
        />
      </CardSection>
    );
  }

  const backgroundCheckRows = isMockFromUrl
    ? mockTableRows(data?.backgroundChecks as BackgroundCheck[])
    : tableRows(data?.backgroundChecks as ApiBackgroundCheck[]);

  return (
    <CardSection title="Background Checks">
      <PomTable
        headers={tableHeaders}
        rows={backgroundCheckRows ?? []}
        emptyRowMessage="There are currently no background checks for this entity."
      />
    </CardSection>
  );
};
