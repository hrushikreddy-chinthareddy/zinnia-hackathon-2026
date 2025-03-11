import {
  AssistiveText,
  AssistiveTextVariant,
  Badge,
  BadgeVariant,
} from '@zinnia/bloom/components';
import CardSection from '../../../components/card-section/CardSection';
import { BackgroundCheck, BackgroundCheckStatus } from '../../../types';
import PomTable from '../../../components/pom-table/PomTable';
import { generateBackgroundChecks } from './__mocks';

const getBadgeVariant = (status: BackgroundCheckStatus): BadgeVariant => {
  switch (status) {
    case BackgroundCheckStatus.IN_PROGRESS:
      return BadgeVariant.INFO;
    case BackgroundCheckStatus.APPROVED:
      return BadgeVariant.SUCCESS;
    case BackgroundCheckStatus.UNDER_REVIEW:
      return BadgeVariant.PENDING;
    case BackgroundCheckStatus.DENIED:
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

const tableRows = (backgroundChecks: BackgroundCheck[]) =>
  backgroundChecks.map((backgroundCheck) => ({
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

export const BackgroundChecks = () => {
  return (
    <CardSection title="Background Checks">
      <PomTable
        headers={tableHeaders}
        rows={tableRows(generateBackgroundChecks())}
        emptyRowMessage="There are currently no background checks for this entity."
      />
    </CardSection>
  );
};
