import { IconType } from '@zinnia/bloom/internal/components';

import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { InfoCard } from '@/components/info-card/InfoCard';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { getRiders } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { CONTACT_NUMBER } from '@/utils/strings';

import { Rider } from './Rider';

export default async function Riders({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { data, error } = await getRiders({
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  const electedRiders = data?.filter(rider => rider.isElected);
  const additionalRiders = data?.filter(rider => !rider.isElected);

  return (
    <div className="container">
      <HeaderBreadcrumb title="Riders" />
      <HeaderPolicyDetails
        planCode={params.planCode}
        policyNumber={params.policyNumber}
      />
      <InfoCard iconType={IconType.LIGHTBULB} className="mb-md">
        <>
          <span className="typography-content-body-sm-bold">
            What's a rider?
          </span>{' '}
          A rider is an add-on to your insurance coverage. Riders are designed
          to offer additional types of coverage for certain circumstances. They
          often (but not always) cost extra. They can provide major benefits if
          and when you need them. You can learn more about what your riders
          cover in your policy documents.
        </>
      </InfoCard>
      {(error || !data) && (
        <div className="container">
          <HeaderBreadcrumb title="Riders" />
          <HeaderPolicyDetails
            policyNumber={params.policyNumber}
            planCode={params.planCode}
          />
          <div className="space-mb-gap-lg">
            <MockMessage />
            <NoDataAvailable
              iconType={IconType.SHIELD_CHECKMARK}
              message="There is currently no riders data available."
            />
          </div>
        </div>
      )}
      {data && data.length && (
        <>
          {!!electedRiders?.length && (
            <div className="card-container">
              <h2>My Riders</h2>
              {electedRiders?.map(rider => (
                <Rider key={rider.riderCode} {...rider} />
              ))}
              <p
                className="typography-content-body-bold mb-md"
                style={{ color: 'var(--Base-Text-text-primary, #212121)' }}
              >
                Need to make a claim? Call{' '}
                <a
                  href={`tel:+${CONTACT_NUMBER}`}
                  className="typography-nav-links-inline"
                >
                  1-800-232-2222
                </a>{' '}
                to begin the process
              </p>
            </div>
          )}
          {!!additionalRiders?.length && (
            <div className="card-container">
              <h2>Additional Riders</h2>
              <p className="typography-content-body">
                Looks like there are additional riders for your policy, but
                they're not covering you—yet.
              </p>
              {additionalRiders?.map(rider => (
                <Rider key={rider.riderCode} {...rider} />
              ))}
              <p
                className="typography-content-body-bold"
                style={{ color: 'var(--Base-Text-text-primary, #212121)' }}
              >
                Need to add a rider? Call{' '}
                <a
                  href={`tel:+${CONTACT_NUMBER}`}
                  className="typography-nav-links-inline"
                >
                  1-800-232-2222
                </a>{' '}
                to begin the process
              </p>
            </div>
          )}
        </>
      )}
      <Footer />
    </div>
  );
}
