import { Status } from '@zinnia/api-types/types/sor';
import {
  Icon,
  IconType,
  Label,
  Popover,
  Tag,
  TagVariant,
} from '@zinnia/bloom/internal/components';

import { FieldData } from '@/components/field-data/FieldData';
import { formatUSDollars } from '@/utils/currency';
import { fullName } from '@/utils/data';
import { standardDateMonthYear } from '@/utils/dates';

import styles from './Rider.module.css';

export const Rider = ({
  elected,
  cost,
  description,
  effectiveDate,
  insured,
  status,
  title,
  policyOwner,
}: {
  elected: boolean;
  cost: number;
  description: string;
  effectiveDate: string;
  insured?: {
    firstName: string;
    lastName: string;
  };
  status?: Status;
  title: string;
  policyOwner?: {
    firstName: string;
    lastName: string;
  };
}) => {
  const insuredSameAsPolicyOwner =
    insured?.firstName === policyOwner?.firstName &&
    insured?.lastName === policyOwner?.lastName;

  return (
    <div className={styles.riderContainer}>
      <h3 className="typography-titles-subtitle">{title}</h3>
      <p className="typography-content-body">{description}</p>
      {status === Status.ACTIVE && (
        <Tag variant={TagVariant.Information} text="Active" className="mt-lg" />
      )}
      <div className={styles.riderDetails}>
        {elected && (
          <>
            {!insuredSameAsPolicyOwner && (
              <FieldData Label={<Label>Insured</Label>}>
                <span className="typography-content-body-sm mt-sm">
                  {fullName({
                    firstName: insured?.firstName || '',
                    lastName: insured?.lastName || '',
                  })}
                </span>
              </FieldData>
            )}
            <FieldData
              Label={
                <Label
                  interactiveElements={[
                    <Popover
                      key={title}
                      title="Effective date"
                      trigger={
                        <Icon
                          width={16}
                          height={16}
                          type={IconType.CIRCLE_INFO}
                          color="var(--colors-base-icon-icon-tooltip, #ff4f00)"
                        />
                      }
                    >
                      <p className="typography-content-body mt-sm">
                        Your rider covers you from this date. So if you
                        experience a qualifying event, like diagnosis of a
                        covered illness, after the effective date and while your
                        policy is active you can make a claim for your rider’s
                        benefit.
                      </p>
                    </Popover>,
                  ]}
                >
                  Effective date
                </Label>
              }
            >
              <span className="typography-content-body-sm">
                {standardDateMonthYear(effectiveDate)}
              </span>
            </FieldData>
          </>
        )}
        <FieldData Label={<Label>Cost</Label>}>
          <span className="typography-content-body-sm mt-sm">
            {formatUSDollars(cost)}
          </span>
        </FieldData>
      </div>
    </div>
  );
};
