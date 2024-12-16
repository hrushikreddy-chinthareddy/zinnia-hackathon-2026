import { Label } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { AccountValue } from '@/components/account-value/AccountValue';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { FieldData } from '@/components/field-data/FieldData';
import { LabelPopover } from '@/components/label-popover/LabelPopover';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { RouteKey, getPageTitle } from '@/route-map';
import { getPolicySurrenderDetails } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { DEFAULT_UNAVAILABLE_STRING } from '@/utils/strings';

const CASH_SURRENDER_VALUE = 'Cash surrender value';

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
                    <LabelPopover
                      key={CASH_SURRENDER_VALUE}
                      title={CASH_SURRENDER_VALUE}
                    >
                      <p>
                        This is the amount you may receive if you cancel your
                        contract early. It's the current account value minus
                        applicable charges, fees, and penalties.
                      </p>
                    </LabelPopover>,
                  ]}
                >
                  {CASH_SURRENDER_VALUE}
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
