import { PolicyRequestInputs } from '@/types/policy';

export const LapsedPolicy = ({
  planCode,
  policyNumber,
}: PolicyRequestInputs) => {
  // TODO: DATA - where do these dates come from?
  return (
    <div className="card">
      <p className="typography-content-body-bold">Lapsed=You’re not covered!</p>
      <p className="typography-content-body my-lg">
        Your policy lapsed on <span>X/X/XXXX</span> due to insufficient funds.
        Once a policy lapses, you must apply for reinstatement. You’ve got until{' '}
        <span>X/X/XXXX</span> to start this process.
      </p>
      <p className="typography-content-body">
        If you’re approved for reinstatement, all you’ll have to do is make a
        payment to get your policy back in action. We’ll keep you updated on
        approval and your required minimum payment via mail.{' '}
      </p>
    </div>
  );
};
