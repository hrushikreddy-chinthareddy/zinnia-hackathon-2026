'use client';

import { ComparisonTableRowProps } from '@xd/xd-components/src/components/ComparisonTable/types';
import {
  Button,
  Icon,
  IconType,
  Label,
  Tag,
  TagVariant,
} from '@zinnia/bloom/components';
import clsx from 'clsx';

import { FieldData } from '@/components/field-data/FieldData';
import commonStyles from '@/components/stepped-workflow/common/Styles.module.css';
import { PaymentLoading } from '@/components/stepped-workflow/common/TransactionLoading';

import { FrequencyAlert } from './FrequencyAlert';

export const SummaryDisplay = ({
  tableData,
}: {
  tableData: {
    amount: ComparisonTableRowProps;
    frequency: ComparisonTableRowProps;
    nextPaymentDate: ComparisonTableRowProps;
    payor: ComparisonTableRowProps;
    bankingDetails: ComparisonTableRowProps;
  };
}) => {
  if (!tableData) {
    return <PaymentLoading />;
  }

  const tableDataEntries = Object.entries(tableData);

  return (
    <div
      className={clsx(
        commonStyles.comparisonTableSummaryDetails,
        commonStyles.mobile
      )}
    >
      <div className={clsx(commonStyles.list, commonStyles.new)}>
        <h3>New Premium Autopay Details</h3>
        {tableDataEntries.map(([key, field]) => (
          <FieldData
            caption={
              field.isNew && <Tag variant={TagVariant.Information} text="New" />
            }
            Label={
              <Label
                interactiveElements={[
                  <Button
                    onClick={field.onEdit}
                    mode="link"
                    key="systematic-premium-type"
                    size="small"
                  >
                    <Icon small type={IconType.EDIT_ALT} />
                  </Button>,
                ]}
              >
                {field.label}
              </Label>
            }
            key={key}
          >
            {field.newValue}
          </FieldData>
        ))}
      </div>
      {tableData.amount.isNew && <FrequencyAlert />}
      {Object.values(tableData).every(field => field.currentValue) && (
        <div className={clsx(commonStyles.list, commonStyles.current)}>
          <h3>Current Premium Autopay Details</h3>
          {tableDataEntries.map(([key, field]) => (
            <FieldData Label={<Label>{field.label}</Label>} key={key}>
              {field.currentValue}
            </FieldData>
          ))}
        </div>
      )}
    </div>
  );
};
