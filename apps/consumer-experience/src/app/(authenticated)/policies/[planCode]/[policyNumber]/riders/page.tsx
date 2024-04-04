import { Status } from '@zinnia/api-types/types/sor';
import { IconType } from '@zinnia/bloom/internal/components';

import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { InfoCard } from '@/components/info-card/InfoCard';
import { PolicyRequestInputs } from '@/types/policy';
import { CONTACT_NUMBER } from '@/utils/strings';

import { Rider } from './Rider';

export default async function Riders({
  params,
}: {
  params: PolicyRequestInputs;
}) {
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

      <div className="card-container">
        <h2>My Riders</h2>
        <Rider
          title="Terminal illness accelerated death benefit rider"
          description="If you are diagnosed with a terminal illness, you can claim the lesser of: 50% of your death benefit or $500,000. "
          cost={11.99}
          effectiveDate="2022-04-03"
          insured={{ firstName: 'todd', lastName: 'smith' }}
          policyOwner={{ firstName: 'john', lastName: 'smith' }}
          status={Status.ACTIVE}
          elected
        />
        <Rider
          title="Terminal illness accelerated death benefit rider"
          description="If you are diagnosed with a terminal illness, you can claim the lesser of: 50% of your death benefit or $500,000. "
          cost={11.99}
          effectiveDate="2022-04-03"
          insured={{ firstName: 'john', lastName: 'smith' }}
          policyOwner={{ firstName: 'john', lastName: 'smith' }}
          status={Status.ACTIVE}
          elected
        />
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
      <div className="card-container">
        <h2>Additional Riders</h2>
        <p className="typography-content-body">
          Looks like there are additional riders for your policy, but they're
          not covering you—yet.
        </p>
        <Rider
          title="Terminal illness accelerated death benefit rider"
          description="If you are diagnosed with a terminal illness, you can claim the lesser of: 50% of your death benefit or $500,000. "
          cost={11.99}
          effectiveDate="2022-04-03"
          elected={false}
        />
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
      <Footer />
    </div>
  );
}
