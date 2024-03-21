import { Label, Icon, IconType } from '@zinnia/bloom/internal/components';
import { headers } from 'next/headers';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { CoveragePopover } from '@/components/policy-overview/CoveragePopover';
import { getCoverae } from '@/services';
import { formatUSDollars } from '@/utils/currency';
import { isNullEmptyOrUndefined } from '@/utils/data';
import { standardDateMonthYear } from '@/utils/dates';
import { DEFAULT_UNAVAILABLE_STRING } from '@/utils/strings';

import styles from './PolicyOverview.module.css';

const COVERAGE = 'Coverage';

export const Coverage = async () => {
  const headerStore = headers();

  const { data, error } = await getCoverae({
    planCode: headerStore.get('planCode') || '',
    policyNumber: headerStore.get('policyNumber') || '',
  });

  if (error) {
    return null;
  }
  const {
    beneficiaryCount,
    totalCoverageAmount,
    policyStartDate,
    maturityDate,
    riderCount,
  } = data!;
  const additionalItems = [];
  if (riderCount > 0) {
    const riderText = riderCount > 1 ? 'riders' : 'rider';
    additionalItems.push({
      content: (
        <FieldData Label={<Label>Riders</Label>}>
          <p className="typography-content-body-sm">{`${riderCount} ${riderText}`}</p>
        </FieldData>
      ),
      linkTo: { url: '/policy-riders', label: 'riders' },
    });
  }

  if (beneficiaryCount) {
    const beneficiaryText =
      beneficiaryCount > 1 ? 'beneficiaries' : 'beneficiary';
    additionalItems.push({
      content: (
        <FieldData Label={<Label>Beneficiary</Label>}>
          <p className="typography-content-body-sm">{`${beneficiaryCount} ${beneficiaryText}`}</p>
        </FieldData>
      ),
      linkTo: { url: '/beneficiaries', label: 'go to beneficiaries page' },
    });
  }

  const coverageContent = isNullEmptyOrUndefined(totalCoverageAmount) ? (
    <p className="typography-content-body-sm">{DEFAULT_UNAVAILABLE_STRING}</p>
  ) : (
    <p className="typography-content-value">
      {formatUSDollars(totalCoverageAmount)}
    </p>
  );

  // TODO: add conditions for policy statuses
  return (
    <ClickableCardContainer listItems={additionalItems}>
      <div className={styles.content}>
        <Icon type={IconType.SHIELD} className={styles.icon} />
        <FieldData
          Label={
            <Label
              interactiveElements={[<CoveragePopover key="coverage-popover" />]}
            >
              {COVERAGE}
            </Label>
          }
          caption={
            policyStartDate && maturityDate
              ? `${standardDateMonthYear(policyStartDate)} - ${standardDateMonthYear(maturityDate)}`
              : ''
          }
        >
          {coverageContent}
        </FieldData>
      </div>
    </ClickableCardContainer>
  );
};
