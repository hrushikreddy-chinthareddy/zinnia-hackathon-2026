import { Label, Icon, IconType } from '@zinnia/bloom/components';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { CoveragePopover } from '@/components/policy-overview/CoveragePopover';
import { getCoverage } from '@/services';
import { formatUSDollars } from '@/utils/currency';
import {
  isAnnuity,
  isNullEmptyOrUndefined,
  lineOfBusinessUrlPath,
} from '@/utils/data';
import { standardDateMonthDayYear } from '@/utils/dates';
import { DEFAULT_UNAVAILABLE_STRING, pluralize } from '@/utils/strings';

import styles from './PolicyOverview.module.css';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';

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
  const { data, error } = await getCoverage({
    planCode,
    policyNumber,
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
    effectiveDate,
  } = data!;
  const additionalItems = [];
  if (riderCount > 0) {
    const riderText = pluralize(
      riderCount,
      isAnnuity(lineOfBusiness) ? 'feature' : 'rider'
    );
    additionalItems.push({
      content: (
        <FieldData
          Label={
            <Label>{isAnnuity(lineOfBusiness) ? 'Features' : 'Riders'}</Label>
          }
        >
          <p className="typography-content-body-sm">{`${riderText}`}</p>
        </FieldData>
      ),
      linkTo: {
        url: `/coverage/${lineOfBusinessUrlPath(lineOfBusiness)}/${planCode}/${policyNumber}/riders`,
        label: isAnnuity(lineOfBusiness) ? 'features' : 'riders',
      },
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
      linkTo: {
        url: `/coverage/${lineOfBusinessUrlPath(lineOfBusiness)}/${planCode}/${policyNumber}/beneficiaries`,
        label: 'go to beneficiaries page',
      },
    });
  }

  const coverageContent = isNullEmptyOrUndefined(totalCoverageAmount) ? (
    <p className="typography-content-body-sm">{DEFAULT_UNAVAILABLE_STRING}</p>
  ) : (
    <p className="typography-content-value">
      {formatUSDollars(totalCoverageAmount)}
    </p>
  );

  return (
    <ClickableCardContainer listItems={additionalItems}>
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
                  <CoveragePopover
                    key="coverage-popover"
                    dataTimestamp={effectiveDate}
                  />,
                ]}
              >
                {COVERAGE}
              </Label>
            }
            caption={
              policyStartDate && maturityDate
                ? `${standardDateMonthDayYear(policyStartDate)} - ${standardDateMonthDayYear(maturityDate)}`
                : ''
            }
          >
            {coverageContent}
          </FieldData>
        </div>
      </ClickableCardContainer.LinkContent>
    </ClickableCardContainer>
  );
};
