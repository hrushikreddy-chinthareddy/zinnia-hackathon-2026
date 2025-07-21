// ANNUITIES
import { IconType } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { Rider } from '@/components/rider/Rider';
import { getRiders } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Riders',
};

export default async function Riders({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const loggingContext = await buildCommonLogContext();
  const { data, error } = await getRiders(
    {
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    },
    loggingContext
  );

  const electedRiders = data?.riders?.filter(rider => rider.isElected);
  const additionalRiders = data?.riders?.filter(rider => !rider.isElected);

  return (
    <div className="container">
      {(error ||
        !data ||
        (!data.riders?.length && !data.additionalBenefits?.length)) && (
        <div className="container">
          <div className="space-mb-gap-lg">
            <NoDataAvailable
              iconType={IconType.SHIELD_CHECKMARK}
              message="There is currently no riders data available."
            />
          </div>
        </div>
      )}
      <>
        {!!electedRiders?.length && (
          <div>
            <h2 className="pb-2xl border-b mt-lg">My Riders</h2>
            {electedRiders?.map(rider => (
              <Rider key={rider.riderCode} {...rider} />
            ))}
          </div>
        )}
        {!!additionalRiders?.length && (
          <div>
            <div>
              <h2 className="pb-2xl border-b mt-lg">Additional Riders</h2>
              <p>
                Looks like there are additional riders for your contract, but
                they're not covering you yet.
              </p>
            </div>
            {additionalRiders?.map(rider => (
              <Rider key={rider.riderCode} {...rider} />
            ))}
          </div>
        )}
      </>
      {!!data?.additionalBenefits?.length && (
        <div>
          <h2 className="pb-2xl border-b mt-lg">Additional Benefits</h2>
          {data.additionalBenefits.map(rider => {
            return (
              <Rider
                key={rider.riderCode}
                {...rider}
                // Hide popover for any additional features that have an effective date
                hidePopover={!!rider.effectiveDate}
              />
            );
          })}
        </div>
      )}
      <CallForAssistance
        callToAction="Online claims are coming soon. For now,"
        contactPrompt="call"
        customInstruction="to make a rider claim."
      />
    </div>
  );
}
