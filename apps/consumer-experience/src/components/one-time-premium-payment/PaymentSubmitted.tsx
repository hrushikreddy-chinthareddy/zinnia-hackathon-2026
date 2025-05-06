'use client';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { toTitleCase } from '@zinnia/utils';

import { Link } from '@/components/link/Link';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { lineOfBusinessUrlPath } from '@/utils/data';

import { FormStepWrapper } from './FormStepWrapper';
import premiumStyles from './OneTimePremiumPayment.module.css';
import { getStepInfo, Steps } from './steps';
import { Name } from '../pii/Name';
import { useOttp } from '../providers/one-time-premium-payment/OttpContext';

export const PaymentSubmitted = ({
  policyNumber,
  planCode,
  lineOfBusiness,
}: PolicyRequestInputs & { lineOfBusiness: LineOfBusiness }) => {
  const { state } = useOttp();
  const { paymentAmount, payorBank } = state;
  const currentStep = getStepInfo({
    step: Steps.SUBMITTED,
    planCode,
    policyNumber,
  });

  const lineOfBusinessPath = lineOfBusinessUrlPath(lineOfBusiness);

  return (
    <FormStepWrapper
      currentStep={Steps.SUBMITTED}
      planCode={planCode}
      policyNumber={policyNumber}
      hideHeader
    >
      <h1 className="mb-xl">{toTitleCase(currentStep.title)}</h1>
      <div className="typography-content-body">
        <p>
          <span className="typography-content-body-bold">
            {formatUSDollars(paymentAmount.plain)}
          </span>{' '}
          one-time premium payment{' '}
          {payorBank && (
            <>
              <span>from</span>{' '}
              <span className="typography-content-body-bold">
                <Name displayName={payorBank.nameOnAccount} />
              </span>
            </>
          )}{' '}
          was submitted.{' '}
        </p>
        <p className="mt-xl">
          There will be a confirmation sent to your email shortly.
        </p>
        <div className={premiumStyles.buttonGroup}>
          <Link
            href={`/coverage/${lineOfBusinessPath}/${planCode}/${policyNumber}`}
            text="Back to policy overview"
            variant="button"
          />
          <Link
            href={`/coverage/${lineOfBusinessPath}/${planCode}/${policyNumber}/premium/history`}
            text="Go to payment history"
          />
        </div>
      </div>
    </FormStepWrapper>
  );
};
