'use client';

import {
  AssistiveText,
  AssistiveTextVariant,
  Button,
  Icon,
  IconType,
  Link,
} from '@zinnia/bloom/components';
import { toSentenceCase } from '@zinnia/utils';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { CarrierPolicyDetails } from '@/types/policy';
import {
  checkIfNull,
  isAnnuity,
  lineOfBusinessDisplayText,
} from '@/utils/data';
import { standardDateMonthDayYear } from '@/utils/dates';

import { acknowledgePolicyAction } from './acknowledge-policy-action';
import styles from './AcknowledgePolicyCard.module.css';
import { ClickableCardContainer } from '../clickable-card-container/ClickableCardContainer';
import { FullName } from '../pii/FullName';

export const AcknowledgePolicyCard = ({
  policy,
}: {
  policy: CarrierPolicyDetails;
}) => {
  const { control, formState, handleSubmit } = useForm();
  const formRef = useRef<HTMLFormElement>(null);
  console.log(formState.errors);

  return (
    <ClickableCardContainer>
      <div>
        <p className="typography-labels-label-lg-alt">
          <span>{policy.marketingName || ''}</span>
        </p>
        <div className={styles.policyDetails}>
          <p className="typography-labels-label-md-alt">{`${toSentenceCase(lineOfBusinessDisplayText(policy.lineOfBusiness))} #: ${checkIfNull(policy.policyNumber)}`}</p>

          <>
            <p className="typography-labels-label-md-alt">
              <span>
                {isAnnuity(policy.lineOfBusiness) ? 'Annuitant' : 'Insured'}
              </span>
              :{' '}
              <FullName
                firstName={policy.firstName}
                lastName={policy.lastName}
              />
            </p>
          </>
        </div>
      </div>
      <form
        ref={formRef}
        className={styles.policyAcknowledgment}
        action={acknowledgePolicyAction}
        onSubmit={evt => {
          evt.preventDefault();
          handleSubmit(() => {
            acknowledgePolicyAction(new FormData(formRef.current!));
          })(evt);
        }}
      >
        <Controller
          control={control}
          name="policyAcknowledged"
          rules={{ required: true }}
          render={({ field }) => (
            <div
              className={
                formState.errors['policyAcknowledged'] ? styles.formError : ''
              }
            >
              {/* TODO: the bloom checkbox isn't working because i think the input is too deeply nested */}
              <label>
                <input
                  type="checkbox"
                  {...field}
                  value={policy.policyNumber}
                  name="policyAcknowledged"
                  id={`${policy.policyNumber}-policyAcknowledgement`}
                />
                <span>
                  {`I acknowledge the receipt of Policy ${policy.policyNumber} issued by ${policy.marketingName}
                    insurance company on ${standardDateMonthDayYear(policy.issueDate)}`}
                </span>
              </label>
              {/* <Checkbox
                {...field}
                value={policy.policyNumber}
                name="policyAcknowledged"
                id={`${policy.policyNumber}-policyAcknowledgement`}
              >
                <span>
                  {`I acknowledge the receipt of Policy ${policy.policyNumber} issued by ${policy.marketingName}
                    insurance company on ${standardDateMonthDayYear(policy.issueDate)}`}
                </span>
              </Checkbox> */}
            </div>
          )}
        />
        <input type="hidden" value={policy.planCode} name="planCode" />
        <input
          type="hidden"
          value={policy.lineOfBusiness}
          name="lineOfBusiness"
        />
        {formState.errors['policyAcknowledged'] && (
          <AssistiveText
            className="my-lg"
            variant={AssistiveTextVariant.Error}
            text="Acknowledgement is required before you can access your policy details"
          />
        )}

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
