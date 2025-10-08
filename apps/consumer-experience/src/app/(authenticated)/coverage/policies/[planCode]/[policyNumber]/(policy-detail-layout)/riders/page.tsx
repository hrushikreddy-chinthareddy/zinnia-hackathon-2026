// POLICIES
import { IconType } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { Rider } from '@/components/rider/Rider';
import { getRiders } from '@/services';
import { getCarrierConfig } from '@/services/carrier-config';
import { PolicyRequestInputs } from '@/types/policy';
import { PolicyRider } from '@/types/riders';
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
  const { data: ridersConfig } = await getCarrierConfig(loggingContext);

  const { data, error } = await getRiders(
    {
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    },
    loggingContext
  );

  const electedRiders = data?.riders?.filter(rider => rider.isElected);
  const additionalRiders = data?.riders?.filter(rider => !rider.isElected);

  if (error || !data || (!electedRiders?.length && !additionalRiders?.length)) {
    return (
      <div className="space-mb-gap-lg">
        <NoDataAvailable
          iconType={IconType.SHIELD_CHECKMARK}
          message="There is currently no riders data available."
        />
      </div>
    );
  }

  return (
    <>
      <RidersSection
        riders={electedRiders}
        title="My Riders"
        showUnbornChildRider={!!ridersConfig?.riders?.showUnbornChildRider}
      />
      <RidersSection
        riders={additionalRiders}
        title="Additional Riders"
        details="Looks like there are additional riders for your policy, but they're not covering you yet."
        showUnbornChildRider={!!ridersConfig?.riders?.showUnbornChildRider}
      />
      <RidersSection
        riders={data.additionalBenefits ?? undefined}
        title="Additional Benefits"
        showUnbornChildRider={!!ridersConfig?.riders?.showUnbornChildRider}
      />
    </>
  );
}

const RidersSection = ({
  riders,
  details,
  title,
  showUnbornChildRider = false,
}: {
  riders?: PolicyRider[];
  title: string;
  details?: string;
  showUnbornChildRider: boolean;
}) => {
  if (!riders?.length) {
    return null;
  }
  return (
    <div>
      <h2 className="pb-2xl border-b mt-lg">{title}</h2>
      {details && <p>{details}</p>}
      {riders.map((rider: PolicyRider) => {
        return (
          <Rider
            key={rider.riderCode}
            {...rider}
            showUnbornChildRider={showUnbornChildRider}
          />
        );
      })}
    </div>
  );
};
