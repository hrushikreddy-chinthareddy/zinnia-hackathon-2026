import { useQuery } from '@tanstack/react-query';
import {
  AssistiveText,
  AssistiveTextVariant,
  Label,
  SideSheet,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { PropsWithChildren } from 'react';

import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { FieldData } from '@/components/field-data/FieldData';
import { SkeletonLoader } from '@/components/skeleton-loader/SkeletonLoader';
import { getCaseDetails } from '@/queries/case-queries';
import { QueryKeys } from '@/queries/query-keys';

import { default as Styles } from '../NotificationCenter.module.css';

export type NotificationCenterSidesheetProps = {
  caseId: string;
  title?: string;
  isCompleted?: boolean;
  fields: {
    label: string;
    value: string;
  }[];
} & PropsWithChildren;

const FETCH_CASE_DETAILS = false;

export const NotificationCenterSidesheet = ({
  caseId,
  children,
  fields,
  title,
  isCompleted,
}: NotificationCenterSidesheetProps) => {
  const description = isCompleted
    ? `Processing complete`
    : 'There was an error processing this transaction.';
  return (
    <SideSheet
      preventCloseOnOutsideClick={false}
      header={'Details'}
      trigger={children}
    >
      <div className={clsx(Styles.caseDetails, 'mb-xl')}>
        <h3 className="typography-labels-label-lg">{title}</h3>
        <p className={!isCompleted ? Styles.transactionError : ''}>
          {description}
        </p>
      </div>
      <div className={Styles.sidesheet}>
        <div className={Styles.fieldContainer}>
          {fields.map(({ label, value }) => (
            <FieldData key={label} Label={<Label>{label}</Label>}>
              {value}
            </FieldData>
          ))}
        </div>
        <NotificationSidesheetDetails caseId={caseId} title={title} />
        <div className={Styles.disclaimer}>
          If you feel like this was an error, or are having trouble processing
          this transaction, please call us at <CarrierPhoneNumber /> and have
          your Case ID handy.
        </div>
      </div>
    </SideSheet>
  );
};

type NotificationSidesheetDetailsProps = {
  title?: string;
  caseId: string;
};

const NotificationSidesheetDetails = ({
  title,
  caseId,
}: NotificationSidesheetDetailsProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [QueryKeys.CASE_DETAILS, caseId],
    queryFn: async () => await getCaseDetails(caseId),
    enabled: caseId.length > 0 && FETCH_CASE_DETAILS,
    select: ({ data }) => data,
  });
  if (!FETCH_CASE_DETAILS) return null;

  return (
    <div className={Styles.details}>
      {title && <h3 className="typography-labels-label-lg">{title}</h3>}
      {isError ? (
        <AssistiveText
          variant={AssistiveTextVariant.Error}
          text="Error fetching case details"
        />
      ) : isLoading ? (
        <SkeletonLoader width="100%" height="100%" />
      ) : (
        <pre
          style={{
            backgroundColor: 'var(--color-base-surface-surface-tertiary)',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};
