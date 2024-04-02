import {
  Icon,
  IconType,
  Label
} from '@zinnia/bloom/internal/components';
import { DEFAULT_UNAVAILABLE_STRING } from '@zinnia/utils';
import clsx from 'clsx';
import { Suspense } from 'react';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { CoveragePopover } from '@/components/policy-overview/CoveragePopover';
import { getCoverage } from '@/services/policy';
import { formatUSDollars } from '@/utils/currency';

import styles from './coverage.module.css';

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
      <HeaderBreadcrumb className={styles.coverageHeader} title="Increase Coverage" />
      <HeaderPolicyDetails className={styles.coverageDetails} planCode={planCode} policyNumber={policyNumber} />
    </>
  )

  if (error || data === null) {
    return (
      <>
        {pageHeader}
        <ClickableCardContainer>
          {DEFAULT_UNAVAILABLE_STRING}
        </ClickableCardContainer>
      </>
    );
  }

  const {
    totalCoverageAmount,
    maximumCoverageIncreaseAmount,
  } = data;
  
  const CURRENT_COVERAGE = 'Current Coverage'
  const INCREASE_COVERAGE = 'Available coverage increase'

  const coverageContent = (amount: number | null | undefined) => {
    if (amount && (typeof amount === 'number')) {
      return (
        <p className="typography-content-value">
          {formatUSDollars(amount)}
        </p>
      )
    } else {
      return (
        <p className="typography-content-body-sm">{DEFAULT_UNAVAILABLE_STRING}</p>
      )
    }
  }

  return (
    <div className={clsx(styles.coveragePage, styles.flexCol)}>
      <Suspense fallback={<div style={{ height: '100vh' }}>Loading...</div>}>
        {pageHeader}
        <div className={clsx(styles.cardContainer, styles.flexCol)}>
          <ClickableCardContainer>
            <div className={styles.infoCard}>
              <div>
                <Icon type={IconType.LIGHTBULB} />
              </div>
              <p className="typography-content-body-sm">
                Coverage increases may require additional underwriting and may have tax consequences. Let us walk you through your options, so you can find the right amount of coverage for you.
              </p>
            </div>
          </ClickableCardContainer>
          <ClickableCardContainer>
            <div className={styles.coverage}>
              <FieldData
                Label={
                  <Label
                    interactiveElements={[<CoveragePopover key="coverage-popover" />]}
                  >
                    {CURRENT_COVERAGE}
                  </Label>
                }
              >
                {coverageContent(totalCoverageAmount)}
              </FieldData>
              <FieldData
                Label={
                  <Label
                    interactiveElements={[<CoveragePopover key="coverage-popover" />]}
                  >
                    {INCREASE_COVERAGE}
                  </Label>
                }
              >
                {coverageContent(maximumCoverageIncreaseAmount)}
              </FieldData>
            </div>
          </ClickableCardContainer>
        </div>
        <p className='typography-content-body-bold '>
          Do you want to increase your coverage? Call <a className='typography-nav-links-inline' href='+18002322222'>1-800-232-2222</a> to begin the process.
        </p>
      </Suspense>
      <Footer className={styles.coverageFooter} />
    </div>
  );
}
