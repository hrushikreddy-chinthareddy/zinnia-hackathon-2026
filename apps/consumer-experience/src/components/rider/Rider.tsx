import { Status } from '@zinnia/api-types/types/sor';
import { Label, Tag, TagVariant } from '@zinnia/bloom/components';
import { toSentenceCase } from '@zinnia/utils';

import { FieldData } from '@/components/field-data/FieldData';
import { PolicyRider } from '@/types/riders';
import { formatUSDollars } from '@/utils/currency';
import { fullName } from '@/utils/data';
import { standardDateMonthDayYear } from '@/utils/dates';

import styles from './Rider.module.css';
import { LabelPopover } from '../label-popover/LabelPopover';

interface RiderProps extends PolicyRider {
  hidePopover?: boolean;
}

export const Rider = ({
  isElected,
  cost,
  description,
  effectiveDate,
  insured,
  status,
  title,
  isOwner,
  hidePopover,
}: RiderProps) => {
  return (
    <div className={styles.riderContainer}>
      <h3 className="typography-titles-subtitle">{toSentenceCase(title)}</h3>
      <p>{description}</p>
      {status === Status.ACTIVE && (
        <Tag variant={TagVariant.Default} text="Active" className="mt-lg" />
      )}
      <div className={styles.riderDetails}>
        {isElected && (
          <>
            {!isOwner && (
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
                  {...(!hidePopover && {
                    interactiveElements: [
                      <LabelPopover key={title} title="Effective date">
                        <p className="mt-sm">
                          Your rider or benefit is valid from this date.
                        </p>
                      </LabelPopover>,
                    ],
                  })}
                >
                  Effective date
                </Label>
              }
            >
              <span className="typography-content-body-sm">
                {standardDateMonthDayYear(effectiveDate)}
              </span>
            </FieldData>
          </>
        )}
        <FieldData Label={<Label>Cost</Label>}>
          <span className="typography-content-body-sm mt-sm">
            {formatUSDollars(cost, true)}
          </span>
        </FieldData>
      </div>
    </div>
  );
};
