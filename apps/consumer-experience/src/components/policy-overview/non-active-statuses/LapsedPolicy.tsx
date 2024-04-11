import { getPolicyStatusDetails } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { standardDateMonthYear } from '@/utils/dates';

export const LapsedPolicy = async ({
  planCode,
  policyNumber,
}: PolicyRequestInputs) => {
  const { data } = await getPolicyStatusDetails({ planCode, policyNumber });

  return (
    <div className="card">
      <p className="typography-content-body-bold">Lapsed=You’re not covered!</p>
      <p className="typography-content-body my-lg">
        Your policy lapsed on{' '}
        <span>{standardDateMonthYear(data?.lapsedOn)}</span> due to insufficient
        funds. Once a policy lapses, you must apply for reinstatement. You’ve
        got until <span>{standardDateMonthYear(data?.reinstatmentDate)}</span>{' '}
        to start this process.
      </p>
      <p className="typography-content-body">
        If you’re approved for reinstatement, all you’ll have to do is make a
        payment to get your policy back in action. We’ll keep you updated on
        approval and your required minimum payment via mail.{' '}
      </p>
    </div>
  );
};
