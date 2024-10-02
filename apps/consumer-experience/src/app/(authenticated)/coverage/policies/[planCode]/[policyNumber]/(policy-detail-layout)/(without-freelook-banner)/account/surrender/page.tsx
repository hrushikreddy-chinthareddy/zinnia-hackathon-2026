import { Icon, IconType, Label, Popover } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { AccountValue } from '@/components/account-value/AccountValue';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { FieldData } from '@/components/field-data/FieldData';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { RouteKey, getPageTitle } from '@/route-map';
import { getPolicySurrenderDetails } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { DEFAULT_UNAVAILABLE_STRING } from '@/utils/strings';

const NET_SURRENDER_VALUE = 'Net surrender value';

const pageTitle = getPageTitle(RouteKey.SURRENDER);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

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
      <>
        <p className="typography-content-body-sm">
          <span className="typography-content-body-sm-bold">
            Are you sure? Surrendering a policy means ending your coverage for a
            lump sum payment of the account surrender value.{' '}
          </span>
          That could mean losing important financial protection for your
          beneficiaries. Surrendering your policy may also have tax
          consequences.
        </p>
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
                        Your net surrender value is the current account value
                        minus surrender charges, outstanding loans, and other
                        fees. This number tells you how much you can expect to
                        receive if you decide to surrender your policy and
                        cancel your coverage.
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
      </>
    );
  };

  return (
    <div className="container">
      {surrenderData()}
      <CallForAssistance
        callToAction="Requesting a surrender is coming soon. For now,"
        customInstruction="to surrender your policy."
        contactPrompt="call"
      />
    </div>
  );
}
