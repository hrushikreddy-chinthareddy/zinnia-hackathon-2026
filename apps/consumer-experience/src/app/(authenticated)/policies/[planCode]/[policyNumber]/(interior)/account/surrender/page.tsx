import {
  Icon,
  IconType,
  Label,
  Popover,
} from '@zinnia/bloom/internal/components';

import { AccountValue } from '@/components/account-value/AccountValue';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { FieldData } from '@/components/field-data/FieldData';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { InfoCard } from '@/components/info-card/InfoCard';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { getPolicySurrenderDetails } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { DEFAULT_UNAVAILABLE_STRING } from '@/utils/strings';

const NET_SURRENDER_VALUE = 'Net surrender value';

export default async function SurrenderPolicy({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  const { data, error } = await getPolicySurrenderDetails({
    planCode,
    policyNumber,
  });

  const surrenderData = () => {
    if (error || !data) {
      return <NoDataAvailable message={DEFAULT_UNAVAILABLE_STRING} />;
    }

    return (
      <div className="card-container">
        <InfoCard iconType={IconType.LIGHTBULB}>
          <p>
            <span className="typography-content-body-sm-bold">
              Are you sure? Surrendering a policy means ending your coverage for
              a lump sum payment.{' '}
            </span>
            That could mean losing important financial protection for your
            beneficiaries. Canceling your policy may also have tax consequences.
          </p>
        </InfoCard>
        <div className="card">
          <div className="column-card">
            <AccountValue
              planCode={planCode}
              policyNumber={policyNumber}
              hideTicker={true}
            />
            <FieldData
              Label={
                <Label
                  interactiveElements={[
                    <Popover
                      key={NET_SURRENDER_VALUE}
                      title={NET_SURRENDER_VALUE}
                      trigger={
                        <Icon
                          type={IconType.CIRCLE_INFO}
                          color="var(--color-base-icon-icon-tooltip, #ff7500)"
                          width={16}
                          height={16}
                        />
                      }
                    >
                      <p>
                        Your net surrender value=the current account value minus
                        surrender charges, outstanding loans, and other fees.
                        This number tells you how much you can expect to receive
                        if you decide to surrender your policy and cancel your
                        coverage.
                      </p>
                    </Popover>,
                  ]}
                >
                  {NET_SURRENDER_VALUE}
                </Label>
              }
            >
              <p className="typography-content-value">
                {formatUSDollars(data?.surrenderValue)}
              </p>
            </FieldData>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <HeaderBreadcrumb title="Surrender policy" />
      {surrenderData()}
      <CallForAssistance customInstruction="to surrender your policy." />
      <Footer />
    </div>
  );
}
