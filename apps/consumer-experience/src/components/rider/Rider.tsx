import { Status } from '@zinnia/api-types/types/sor';
import {
  AssistiveText,
  AssistiveTextVariant,
  Label,
} from '@zinnia/bloom/components';
import { DEFAULT_ERROR_STRING, toSentenceCase } from '@zinnia/utils';

import { FieldData } from '@/components/field-data/FieldData';
import { PolicyRider } from '@/types/riders';
import { formatUSDollars } from '@/utils/currency';
import { fullName } from '@/utils/data';
import { standardDateMonthDayYear } from '@/utils/dates';

import styles from './Rider.module.css';
import { LabelPopover } from '../label-popover/LabelPopover';

interface RiderProps extends PolicyRider {
  hidePopover?: boolean;
  // special client specific field for Everly
  // see [DEPU-4946](https://zinnia.atlassian.net/browse/DEPU-4946)
  futureChildren?: boolean | null;
}

export const Rider = ({
  isElected,
  cost,
  coverageId,
  description,
  effectiveDate,
  futureChildren,
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
        <AssistiveText
          variant={AssistiveTextVariant.Success}
          text="Active"
          className="mt-lg"
        />
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
            {coverageId === 'Rider_CTR' && (
              <FieldData Label={<Label>Future children covered</Label>}>
                <span className="typography-content-body-sm mt-sm">
                  {(futureChildren === undefined || futureChildren === null)
                    ? DEFAULT_ERROR_STRING
                    : futureChildren
                      ? 'Yes'
                      : 'No'}
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
