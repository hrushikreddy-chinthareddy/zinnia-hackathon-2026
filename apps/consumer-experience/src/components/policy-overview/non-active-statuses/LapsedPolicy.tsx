import { getPolicyStatusDetails } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { standardDateMonthDayYear } from '@/utils/dates';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

export const LapsedPolicy = async ({
  planCode,
  policyNumber,
}: PolicyRequestInputs) => {
  const loggingContext = await buildCommonLogContext();
  const { data } = await getPolicyStatusDetails(
    { planCode, policyNumber },
    loggingContext
  );

  return (
    <div className="card">
      <p className="typography-content-body-bold">
        Lapsed means you're not covered.
      </p>
      <p className="typography-content-body my-lg">
        Your policy lapsed on{' '}
        <span>{standardDateMonthDayYear(data?.lapsedOn)}</span> due to
        insufficient funds. Once a policy lapses, you must apply for
        reinstatement. You’ve got <span>{data?.reinstatementPeriod}</span> years
        from the date your policy lapsed to start this process.
      </p>
      <p className="typography-content-body">
        If you’re approved for reinstatement, all you’ll have to do is make a
        payment to get your policy back in action. We’ll keep you updated on
        approval and your required minimum payment via mail.
      </p>
    </div>
  );
};
