'use client';

import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import {
  AssistiveText,
  AssistiveTextVariant,
  Checkbox,
  Icon,
  IconType,
  Link,
  LoaderVariant,
  SpinnerButton,
} from '@zinnia/bloom/components';
import { toSentenceCase } from '@zinnia/utils';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { CarrierNames } from '@/types/carriers';
import { CarrierPolicyDetails } from '@/types/policy';
import { getCarrierNameById } from '@/utils/carriers';
import {
  checkIfNull,
  isAnnuity,
  lineOfBusinessDisplayText,
  lineOfBusinessUrlPath,
} from '@/utils/data';
import { standardDateMonthDayYear } from '@/utils/dates';

import { acknowledgePolicyAction } from './acknowledge-policy-action';
import styles from './AcknowledgePolicyCard.module.css';
import { ClickableCardContainer } from '../clickable-card-container/ClickableCardContainer';
import { FullName } from '../pii/FullName';

export interface AckowledgeInputs {
  policyAcknowledged: boolean;
  planCode: string;
  policyNumber: string;
  lineOfBusiness: LineOfBusiness;
}

const acknowledgmentCopy = ({
  carrierId,
  policyNumber,
  issueDate,
}: {
  carrierId?: string;
  policyNumber: string;
  issueDate?: string | null;
}) => {
  const carrierName = getCarrierNameById(carrierId);
  const issueDateFormatted = standardDateMonthDayYear(issueDate);

  if (carrierName === CarrierNames.EVERLY) {
    return (
      <span>
        {`I acknowledge the receipt of Policy ${policyNumber} issued by ${carrierName}
        insurance company on ${issueDateFormatted}`}
      </span>
    );
  }

  return (
    <span>
      {`I acknowledge the receipt of Policy ${policyNumber} issued by ${carrierName} on ${issueDateFormatted}`}
    </span>
  );
};

export const AcknowledgePolicyCard = ({
  policy,
}: {
  policy: CarrierPolicyDetails;
}) => {
  const { planCode, policyNumber, lineOfBusiness, carrierId } = policy;
  const router = useRouter();
  const {
    control,
    formState,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<AckowledgeInputs>({
    defaultValues: {
      policyAcknowledged: false,
      planCode,
      policyNumber,
      lineOfBusiness,
    },
  });

  const onSubmit: SubmitHandler<AckowledgeInputs> = async data => {
    try {
      await acknowledgePolicyAction(data);
    } catch (error) {
      console.error(error);
    } finally {
      router.push(
        `/coverage/${lineOfBusinessUrlPath(lineOfBusiness)}/${planCode}/${policyNumber}`
      );
    }
  };

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
        className={styles.policyAcknowledgment}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Controller
          control={control}
          name="policyAcknowledged"
          rules={{ required: true }}
          render={({ field }) => (
            <div>
              <Checkbox
                name="policyAcknowledged"
                onClick={field.onChange}
                showError={!!formState.errors['policyAcknowledged']}
                id={`${policy.policyNumber}-policyAcknowledgement`}
              >
                {acknowledgmentCopy({
                  carrierId,
                  policyNumber,
                  issueDate: policy.issueDate,
                })}
              </Checkbox>
            </div>
          )}
        />

        {formState.errors['policyAcknowledged'] && (
          <AssistiveText
            className="my-lg"
            variant={AssistiveTextVariant.Error}
            text="Acknowledgement is required before you can access your policy details"
          />
        )}

        <div className={styles.policyAcknowledgmentActions}>
          <SpinnerButton
            expand
            type="submit"
            disabled={isSubmitting}
            variant={LoaderVariant.CTA}
            hide={!isSubmitting}
            className={styles.submit}
          >
            <span>Go to policy</span>
          </SpinnerButton>
          <span className={styles.viewPolicyDocument}>
            <Link
              href={`/coverage/${lineOfBusinessUrlPath(lineOfBusiness)}/${planCode}/${policyNumber}/documents/policy-acknowledgement?clientCode=${carrierId}`}
              text="View policy document"
              // TODO: i'm not sure why this is throwing an error, this component extends teh anchor element
              // so should have target attribute by default
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              target="_blank"
            />
            {/* TODO: had to add this here because teh component defaults it to in front of text
            will need to also fix hover color */}
            <Icon type={IconType.EXTERNAL_LINK} className="ml-sm" />
          </span>
        </div>
      </form>
    </ClickableCardContainer>
  );
};
