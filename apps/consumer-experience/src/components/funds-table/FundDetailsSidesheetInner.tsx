'use client';
import { Label, Icon, IconType } from '@zinnia/bloom/components';
import { ReactNode } from 'react';
import { z } from 'zod';

import { Fund } from '@/services/funds/types';
import { formatUSDollars } from '@/utils/currency';
import { percentFormatify } from '@/utils/numbers';
import { toSentenceCase, DEFAULT_ERROR_STRING } from '@/utils/strings';
import { FundAccountTypeEnum } from '@zinnia/api-types/types/funds';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';

import styles from './FundDetailsSidesheetInner.module.css';
import { allocationAccountInfo, sweepDateInfo } from './utils';
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
  title,
  innerContent,
}: {
  title: string;
  innerContent: ReactNode;
}) => {
  return (
    <ControlledSidesheet
      showOverlay={false}
      key="fundType"
      closeBeforeContent="Back to details"
      header={title}
      trigger={
        <Icon
          className={styles.sidesheetTrigger}
          type={IconType.CIRCLE_INFO}
          color="var(--color-base-icon-icon-tooltip, #ff7500)"
          small
        />
      }
    >
      <p>{innerContent}</p>
    </ControlledSidesheet>
  );
};

export const FundDetailsSidesheetInner = ({
  fundDetails,
  lineOfBusiness,
}: {
  fundDetails?: Fund;
  lineOfBusiness?: LineOfBusiness;
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
                    title="Type"
                    innerContent={
                      <>
                        <p className="mb-xl">
                          Accounts can be either index or fixed.
                        </p>
                        <p className="mb-xl">
                          Fixed accounts have a guaranteed interest rate for a
                          specified period or segment. (Interest rate may be
                          subject to change at the beginning of a new segment.)
                        </p>
                        <p className="mb-xl">
                          Index accounts are credited with interest based on the
                          performance of an underlying index and the account’s
                          participation rate or segment cap rate (these are set
                          by the carrier and are guaranteed for each segment but
                          can change at the beginning of a new segment). Index
                          accounts can offer the potential for higher interest
                          crediting based, in part, on the performance of an
                          underlying index, but it can also be zero in down
                          markets.
                        </p>
                      </>
                    }
                  />,
                ]}
              >
                {toSentenceCase('type')}
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
                  title="Interest rate"
                  innerContent="This is the rate of growth being earned on the amount within a fixed account or holding account."
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
                title="Value"
                innerContent={allocationAccountInfo(lineOfBusiness)}
              />,
            ]}
          >
            {toSentenceCase('value')}
          </Label>
        }
      >
        {formatUSDollars(fundDetails.totalFundValue, true)}
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
                  title="Next sweep date"
                  innerContent={sweepDateInfo(lineOfBusiness)}
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
