'use client';
import {
  AssistiveText,
  AssistiveTextVariant,
  Button,
  Checkbox,
  Icon,
  IconType,
  Link,
} from '@zinnia/bloom/components';
import { Controller, useForm } from 'react-hook-form';

import { CarrierPolicyDetails } from '@/types/policy';
import { standardDateMonthDayYear } from '@/utils/dates';

import styles from './AcknowledgePolicyCard.module.css';
import { ClickableCardContainer } from '../clickable-card-container/ClickableCardContainer';
import { PolicyDetailsSummary } from '../policy-details-summary/PolicyDetailsSummary';

export const AcknowledgePolicyCard = ({
  policy,
}: {
  policy: CarrierPolicyDetails;
}) => {
  const { control, formState, handleSubmit } = useForm();

  return (
    <ClickableCardContainer>
      <PolicyDetailsSummary
        className="pl-none"
        planCode={policy.planCode || ''}
        policyNumber={policy.policyNumber}
        summary={{ ...policy, policyStatus: undefined }}
      />
      <form
        className={styles.policyAcknowledgment}
        onSubmit={handleSubmit(() => {
          console.log('submitted');
        })}
      >
        <Controller
          control={control}
          name={`${policy.policyNumber}-policyAcknowledgement`}
          rules={{ required: true }}
          render={({ field }) => (
            <div
              className={
                formState.errors[`${policy.policyNumber}-policyAcknowledgement`]
                  ? styles.formError
                  : ''
              }
            >
              <Checkbox
                {...field}
                id={`${policy.policyNumber}-policyAcknowledgement`}
              >
                {/* TODO: figure out delivery date */}
                {/* TODO: i think i might need to update variables in bloom for this, its using default colors */}
                <span>
                  {`I acknowledge the receipt of Policy ${policy.policyNumber} issued by Everly Life
                    insurance company on ${standardDateMonthDayYear(policy.issueDate)}`}
                </span>
              </Checkbox>
              {formState.errors[
                `${policy.policyNumber}-policyAcknowledgement`
              ] && (
                <AssistiveText
                  className="my-lg"
                  variant={AssistiveTextVariant.Error}
                  text="Acknowledgement is required before you can access your policy details"
                />
              )}
            </div>
          )}
        />

        <div className={styles.policyAcknowledgmentActions}>
          <Button type="submit">Go to policy</Button>
          <span className={styles.viewPolicyDocument}>
            <Link href="#" text="View policy document" />
            {/* TODO: had to add this here because teh component defaults it to in front of text
            will need to also fix hover color */}
            <Icon type={IconType.EXTERNAL_LINK} className="ml-sm" />
          </span>
        </div>
      </form>
    </ClickableCardContainer>
  );
};
