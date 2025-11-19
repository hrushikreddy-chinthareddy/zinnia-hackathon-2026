import { Label, Icon, IconType } from '@zinnia/bloom/components';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { CoveragePopover } from '@/components/policy-overview/CoveragePopover';
import { getCoverage } from '@/services';
import { formatUSDollars } from '@/utils/currency';
import { isNullEmptyOrUndefined, lineOfBusinessUrlPath } from '@/utils/data';
import { standardDateMonthDayYear, yearsLeft } from '@/utils/dates';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { DEFAULT_UNAVAILABLE_STRING } from '@/utils/strings';
import { LineOfBusiness, ProductType } from '@zinnia/api-types/types/sor';

import styles from './PolicyOverview.module.css';

const COVERAGE = 'Coverage';

interface Props {
  planCode: string;
  policyNumber: string;
  lineOfBusiness?: LineOfBusiness;
}

export const Coverage = async ({
  planCode,
  policyNumber,
  lineOfBusiness,
}: Props) => {
  const loggingContext = await buildCommonLogContext();
  const { data, error } = await getCoverage(
    {
      planCode,
      policyNumber,
    },
    loggingContext
  );

  //TODO: Do we need an error state?
  if (error) {
    return null;
  }
  const {
    totalCoverageAmount,
    policyStartDate,
    maturityDate,
    policyTerm,
    policyProductType,
  } = data!;

  const elapsedYears = yearsLeft(policyStartDate, policyTerm);

  const coverageContent = isNullEmptyOrUndefined(totalCoverageAmount) ? (
    <p className="typography-content-body-sm">{DEFAULT_UNAVAILABLE_STRING}</p>
  ) : (
    <p className="typography-content-value">
      {formatUSDollars(totalCoverageAmount)}
    </p>
  );

  const dateInterval =
    policyStartDate && maturityDate
      ? `${standardDateMonthDayYear(policyStartDate)} - ${standardDateMonthDayYear(maturityDate)}`
      : '';
  const timeLeft = `${policyTerm} year term length (${elapsedYears} years left)`;

  const caption =
    policyProductType === ProductType.TERM ? timeLeft : dateInterval;

  return (
    <ClickableCardContainer>
      <ClickableCardContainer.LinkContent
        linkTo={{
          url: `/coverage/${lineOfBusinessUrlPath(lineOfBusiness)}/${planCode}/${policyNumber}/my-coverage`,
          label: 'go to coverage page',
        }}
      >
        <div className={styles.content}>
          <Icon type={IconType.SHIELD} className={styles.icon} />
          <FieldData
            Label={
              <Label
                interactiveElements={[
                  <CoveragePopover key="coverage-popover" />,
                ]}
              >
                {COVERAGE}
              </Label>
            }
            caption={caption}
          >
            {coverageContent}
          </FieldData>
        </div>
      </ClickableCardContainer.LinkContent>
    </ClickableCardContainer>
  );
};
