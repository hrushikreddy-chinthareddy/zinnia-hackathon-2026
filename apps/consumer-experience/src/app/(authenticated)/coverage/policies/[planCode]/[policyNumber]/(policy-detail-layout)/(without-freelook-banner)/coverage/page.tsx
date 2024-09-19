import { Label } from '@zinnia/bloom/components';
import { DEFAULT_UNAVAILABLE_STRING } from '@zinnia/utils';
import { Metadata } from 'next';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { RouteKey, getPageTitle } from '@/route-map';
import { getCoverage } from '@/services/policy';
import { formatUSDollars } from '@/utils/currency';

import styles from './coverage.module.css';

const pageTitle = getPageTitle(RouteKey.COVERAGE);
// disable because NextJS needs this to be exported from this file
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

  if (error || data === null) {
    return (
      <>
        <NoDataAvailable />
      </>
    );
  }

  const { totalCoverageAmount } = data;

  const CURRENT_COVERAGE = 'Current Coverage';

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
      <p className="typography-content-body-sm">
        Coverage increases may require additional underwriting and may have tax
        consequences. Let us walk you through your options, so you can find the
        right amount of coverage for you.
      </p>

      <ClickableCardContainer>
        <div className={styles.coverageValues}>
          <FieldData Label={<Label>{CURRENT_COVERAGE}</Label>}>
            {coverageContent(totalCoverageAmount)}
          </FieldData>

          {/* Removing this for now because it should consider all of a users policies under one carrier
          and right now the data value is only based on the single policy being used */}
          {/* <FieldData Label={<Label>{INCREASE_COVERAGE}</Label>}>
            {coverageContent(maximumCoverageIncreaseAmount)}
          </FieldData> */}
        </div>
      </ClickableCardContainer>
      <CallForAssistance
        callToAction="Requesting a coverage change is coming soon. For now,"
        contactPrompt="call"
        customInstruction="to inquire."
      />
    </div>
  );
}
