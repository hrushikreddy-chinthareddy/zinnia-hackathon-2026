"use client"

import {
  Label,
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
} from '@zinnia/bloom/internal/components';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { PolicyCoverage, PolicyStatus } from '@/types/policy';
import { PolicyRiders } from '@/types/riders';
import { formatUSDollars } from '@/utils/currency';
import { standardDateMonthYear } from '@/utils/dates';

import styles from './PolicyOverview.module.css';

const COVERAGE = 'Coverage';

const CoveragePopover = () => {
  return (
    <Popover
      title={COVERAGE}
      trigger={
        <Icon
          type={IconType.CIRCLE_INFO}
          width={16}
          height={16}
          color="var(--color-primary-color-primary, #ff7500)"
        />
      }
      placement={PopoverPlacement.BottomRight}
    >
      <div className={styles.popoverContent}>
        <p>
          Rest assured, you’re insured for this amount as long as your policy is
          active. Your coverage amount is also referred to as the policy’s
          “death benefit.” If something happens to you, your beneficiaries can
          claim this amount.
        </p>
      </div>
    </Popover>
  );
};

interface Props extends PolicyCoverage {
  policyStatus: PolicyStatus;
  riders: PolicyRiders[];
}

export const Coverage = ({
  totalCoverageAmount,
  policyStartDate,
  maturityDate,
  beneficiaryCount,
  riders,
}: Props) => {
  // TODO: figure out the possible rider statuses!!!
  const activeAndElectedRiders = riders?.filter(
    rider => rider.status === 'ACTIVE' && rider.riderElected === 'ELECTED'
  );

  const additionalItems = [];

  if (riders?.length > 0) {
    additionalItems.push({
      content: (
        <FieldData Label={<Label>Riders</Label>}>
          <p className="typography-content-body-sm">{`${activeAndElectedRiders.length} of ${riders.length} riders`}</p>
        </FieldData>
      ),
      linkTo: { url: '/policy-riders', label: 'riders' },
    });
  }

  if (beneficiaryCount) {
    additionalItems.push({
      content: (
        <FieldData Label={<Label>Beneficiary</Label>}>
          <p className="typography-content-body-sm">{`${beneficiaryCount} beneficiaries`}</p>
        </FieldData>
      ),
      linkTo: {url: '/beneficiaries', label: 'go to beneficiaries page'}
    });
  }

  // TODO: add conditions for policy statuses
  return (
    <ClickableCardContainer listItems={additionalItems}>
      <div className={styles.content}>
        <Icon type={IconType.SHIELD} className={styles.icon} />
        <FieldData
          large
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
          <p className="typography-content-value">
            {formatUSDollars(totalCoverageAmount)}
          </p>
        </FieldData>
      </div>
    </ClickableCardContainer>
  );
};
