import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { AccountValue } from '@/components/policy-overview/AccountValue';
import { StatusIconText } from '@/components/status-icon-text/StatusIconText';
import { PolicyRequestInputs } from '@/types/policy';

export default async function AccountValuePage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  return (
    <div>
      <HeaderBreadcrumb title="Account value" />
      <HeaderPolicyDetails planCode={planCode} policyNumber={policyNumber} />
      <ClickableCardContainer
        listItems={[
          {
            content: (
              <div className="stacked-items">
                <span className="typography-labels-label-md-alt">Funds</span>
                <span
                  className="typography-content-caption"
                  style={{ color: 'var(--color-base-text-text-secondary)' }}
                >
                  1 Fund
                </span>
              </div>
            ),
            linkTo: {
              url: `/policies/${planCode}/${policyNumber}/account-value/funds`,
              label: 'go to funds page',
            },
          },
          {
            content: (
              <div className="stacked-items">
                <span className="typography-labels-label-md-alt">
                  Make a withdrawal
                </span>
                <StatusIconText
                  isEligible
                  className="typography-content-caption"
                />
              </div>
            ),
            linkTo: {
              url: `/policies/${planCode}/${policyNumber}/account-value/withdrawal`,
              label: 'go to funds page',
            },
          },
          {
            content: (
              <div className="stacked-items">
                <span className="typography-labels-label-md-alt">
                  Take a loan
                </span>
                <StatusIconText
                  isEligible={false}
                  className="typography-content-caption"
                />
              </div>
            ),
            linkTo: {
              url: `/policies/${planCode}/${policyNumber}/account-value/loan`,
              label: 'go to funds page',
            },
          },
        ]}
      >
        <AccountValue
          planCode={planCode}
          policyNumber={policyNumber}
          hideLabel
        />
      </ClickableCardContainer>
      <Footer />
    </div>
  );
}
