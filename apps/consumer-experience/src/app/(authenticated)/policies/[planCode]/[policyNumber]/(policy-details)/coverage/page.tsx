import { IconType, Label } from '@zinnia/bloom/internal/components';
import { DEFAULT_UNAVAILABLE_STRING } from '@zinnia/utils';
import { Metadata } from 'next';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { InfoCard } from '@/components/info-card/InfoCard';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { getCoverage } from '@/services/policy';
import { formatUSDollars } from '@/utils/currency';

import styles from './coverage.module.css';

const pageTitle = 'Increase Coverage';

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

export default async function Beneficiaries({
  params,
}: {
  params: {
    planCode: string;
    policyNumber: string;
  };
}) {
  const planCode = params.planCode;
  const policyNumber = params.policyNumber;

  const { data, error } = await getCoverage({
    planCode,
    policyNumber,
  });

  const pageHeader = (
    <>
      <HeaderBreadcrumb className={styles.coverageHeader} title={pageTitle} />
    </>
  );

  if (error || data === null) {
    return (
      <>
        {pageHeader}
        <NoDataAvailable />
      </>
    );
  }

  const { totalCoverageAmount, maximumCoverageIncreaseAmount } = data;

  const CURRENT_COVERAGE = 'Current Coverage';
  const INCREASE_COVERAGE = 'Available coverage increase';

  const coverageContent = (amount: number | null | undefined) => {
    if (amount && typeof amount === 'number') {
      return (
        <p className="typography-content-value">{formatUSDollars(amount)}</p>
      );
    } else {
      return (
        <p className="typography-content-body-sm">
          {DEFAULT_UNAVAILABLE_STRING}
        </p>
      );
    }
  };

  return (
    <div className="container">
      {pageHeader}
      <div className="card-container">
        <InfoCard iconType={IconType.LIGHTBULB}>
          <p className="typography-content-body-sm">
            Coverage increases may require additional underwriting and may have
            tax consequences. Let us walk you through your options, so you can
            find the right amount of coverage for you.
          </p>
        </InfoCard>
        <ClickableCardContainer>
          <div className={styles.coverageValues}>
            <FieldData Label={<Label>{CURRENT_COVERAGE}</Label>}>
              {coverageContent(totalCoverageAmount)}
            </FieldData>
            <FieldData Label={<Label>{INCREASE_COVERAGE}</Label>}>
              {coverageContent(maximumCoverageIncreaseAmount)}
            </FieldData>
          </div>
        </ClickableCardContainer>
      </div>
      <CallForAssistance
        callToAction="Do you want to increase your coverage?"
        customInstruction="to begin the process."
      />
    </div>
  );
}
