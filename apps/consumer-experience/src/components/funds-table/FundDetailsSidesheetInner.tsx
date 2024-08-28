'use client';
import { FundAccountTypeEnum } from '@zinnia/api-types/types/funds';
import { Label, Icon, IconType } from '@zinnia/bloom/components';
import { toSentenceCase } from '@zinnia/utils';
import { ReactNode } from 'react';
import { z } from 'zod';

import { Fund } from '@/services/funds';
import { formatUSDollars } from '@/utils/currency';
import { percentFormatify } from '@/utils/numbers';
import { DEFAULT_ERROR_STRING } from '@/utils/strings';

import styles from './FundDetailsSidesheetInner.module.css';
import { ControlledSidesheet } from '../controlled-sidesheet/ControlledSidesheet';
import { FieldData } from '../field-data/FieldData';

const fundTypeDisplayMap: Partial<Record<FundAccountTypeEnum, string>> = {
  [FundAccountTypeEnum.FIXED]: 'Fixed',
  [FundAccountTypeEnum.INDEXED]: 'Index',
  [FundAccountTypeEnum.HOLDING]: 'Holding',
};

// If you change the values of any of these keys, you also need to update the check in the render
// to make sure it's checking for the right property in the returned schema
const fundValidator = z.object({
  fundId: z.string(),
  fundName: z.string().nullable().optional(),
  totalFundValue: z.number().nullable().optional(),
  fundAccountType: z.nativeEnum(FundAccountTypeEnum),
  allocationPercentage: z.number().nullable().optional(),
  interestRate: z.number().nullable().optional(),
  sweepDate: z.string().nullable().optional(),
});

const holdingFundSchema = fundValidator.pick({
  interestRate: true,
  totalFundValue: true,
  sweepDate: true,
});

const indexFundSchema = fundValidator.pick({
  totalFundValue: true,
  fundAccountType: true,
  allocationPercentage: true,
});

const fixedFundSchema = fundValidator.pick({
  totalFundValue: true,
  fundAccountType: true,
  allocationPercentage: true,
  interestRate: true,
});

const getAccountTypeSchema = (fundDetails: Fund) => {
  const accountType = fundDetails.fundAccountType;

  switch (accountType) {
    case FundAccountTypeEnum.HOLDING:
      return holdingFundSchema.safeParse(fundDetails)?.data;
    case FundAccountTypeEnum.FIXED:
      return fixedFundSchema.safeParse(fundDetails)?.data;
    case FundAccountTypeEnum.INDEXED:
      return indexFundSchema.safeParse(fundDetails)?.data;
    default:
      return null;
  }
};

const ItemDescriptionSidesheet = ({
  innerContent,
}: {
  innerContent: ReactNode;
}) => {
  return (
    <ControlledSidesheet
      showOverlay={false}
      key="fundType"
      closeBeforeContent="Back to fund details"
      header="Fund type"
      trigger={
        <Icon
          className={styles.sidesheetTrigger}
          type={IconType.CIRCLE_INFO}
          color="var(--color-base-icon-icon-tooltip, #ff7500)"
          small
        />
      }
    >
      <p className="typography-content-body">{innerContent}</p>
    </ControlledSidesheet>
  );
};

export const FundDetailsSidesheetInner = ({
  fundDetails,
}: {
  fundDetails?: Fund;
}) => {
  if (!fundDetails) {
    return null;
  }

  const accountTypeSchema = getAccountTypeSchema(fundDetails);

  if (!accountTypeSchema) {
    return null;
  }

  return (
    <div className={styles.detailsTable}>
      {'fundAccountType' in accountTypeSchema &&
        accountTypeSchema?.fundAccountType && (
          <FieldData
            Label={
              <Label
                interactiveElements={[
                  <ItemDescriptionSidesheet
                    key="fundType"
                    innerContent="Funds can be either an index fund or a fixed fund. Fixed funds have a guaranteed interest rate.  Index funds have variable interest rates depending on market conditions. They track an index fund on the stock market, and often have either a participation rate or segment cap rate that is set by the carrier. The performance of the index combined with the  participating or segment cap rate determines earnings on your contirbutions. "
                  />,
                ]}
              >
                {toSentenceCase('fund type')}
              </Label>
            }
          >
            {fundDetails.fundAccountType
              ? fundTypeDisplayMap[fundDetails.fundAccountType]
              : DEFAULT_ERROR_STRING}
          </FieldData>
        )}

      {'interestRate' in accountTypeSchema && (
        <FieldData
          Label={
            <Label
              interactiveElements={[
                <ItemDescriptionSidesheet
                  key="interestRate"
                  innerContent="This is the amount of your account value currently invested in this specific fund."
                />,
              ]}
            >
              {toSentenceCase('interest rate')}
            </Label>
          }
        >
          {percentFormatify(fundDetails.interestRate, {
            isInteger: true,
          })}
        </FieldData>
      )}

      <FieldData
        Label={
          <Label
            interactiveElements={[
              <ItemDescriptionSidesheet
                key="totalFundValue"
                innerContent="This is the amount of your account value currently invested in this specific fund."
              />,
            ]}
          >
            {toSentenceCase('fund value')}
          </Label>
        }
      >
        {formatUSDollars(fundDetails.totalFundValue)}
      </FieldData>

      {'allocationPercentage' in accountTypeSchema && (
        <FieldData Label={<Label>{toSentenceCase('allocation')}</Label>}>
          {percentFormatify(fundDetails.allocationPercentage, {
            isInteger: true,
          })}
        </FieldData>
      )}

      {'sweepDate' in accountTypeSchema && (
        <FieldData
          Label={
            <Label
              interactiveElements={[
                <ItemDescriptionSidesheet
                  key="sweepDate"
                  innerContent="On this date, all money in the holding fund will be “swept” or moved into the policy’s various funds, according to your elected fund allocations. In most cases, the sweep date happens on the same date every month."
                />,
              ]}
            >
              {toSentenceCase('next sweep date')}
            </Label>
          }
        >
          {fundDetails.sweepDate}
        </FieldData>
      )}
    </div>
  );
};
