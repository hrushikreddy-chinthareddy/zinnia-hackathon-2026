'use client';

import { Link } from '@/components/link/Link';
import { default as commonStyles } from '@/components/stepped-workflow/common/Styles.module.css';
import { useGetBasePolicyPath } from '@/hooks/use-get-base-policy-path';
import { lineOfBusinessDisplayText } from '@/utils/data';
import { toSentenceCase } from '@/utils/strings';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';

export const Submission = ({
  lineOfBusiness,
}: {
  lineOfBusiness: LineOfBusiness;
}) => {
  const baseUrl = useGetBasePolicyPath();

  return (
    <>
      <p className="typography-content-body mb-lg">
        Your request to&nbsp;
        <span className="typography-content-body-bold">
          cancel your {lineOfBusinessDisplayText(lineOfBusiness)}
        </span>{' '}
        was submitted.
      </p>
      There will be a confirmation sent to your email shortly. Processing times
      depend on your surrender type and method.
      <div className={commonStyles.stepActions}>
        <Link
          variant="button"
          href={baseUrl}
          text={`Back to ${toSentenceCase(lineOfBusinessDisplayText(lineOfBusiness))} Overview`}
        />
      </div>
    </>
  );
};
