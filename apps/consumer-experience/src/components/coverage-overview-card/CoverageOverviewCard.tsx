import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { Label } from '@zinnia/bloom/components';

import styles from '@/app/(authenticated)/coverage/policies.module.css';
import { CarrierPolicyDetails } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { lineOfBusinessUrlPath } from '@/utils/data';

import { AccountValuePopover } from '../account-value/AccountValuePopover';
import { ClickableCardContainer } from '../clickable-card-container/ClickableCardContainer';
import { FieldData } from '../field-data/FieldData';
import { LabelPopover } from '../label-popover/LabelPopover';
import { PolicyDetailsSummary } from '../policy-details-summary/PolicyDetailsSummary';
import { CoveragePopover } from '../policy-overview/CoveragePopover';

// TODO: move the styles into this component folder
export const CoverageOverviewCard = ({
  policy,
}: {
  policy: CarrierPolicyDetails;
}) => {
  return (
    <ClickableCardContainer>
      <ClickableCardContainer.LinkContent
        linkTo={{
          label: `Get details for Policy ${policy.marketingName}`,
          url: `/coverage/${lineOfBusinessUrlPath(policy?.lineOfBusiness)}/${policy.planCode}/${policy.policyNumber}`,
          isInternal: true,
        }}
      >
        <div className={`${styles.policyCard} mr-lg`}>
          <PolicyDetailsSummary
            className="pl-none"
            planCode={policy.planCode || ''}
            policyNumber={policy.policyNumber}
            summary={{ ...policy }}
          />
          <div className={styles.policyCardPolicyValues}>
            <FieldData
              className="mr-3xl typography-content-body-sm-bold"
              Label={
                <Label
                  interactiveElements={[
                    <AccountValuePopover
                      key="account-value-popover"
                      // Date of last policy transaction, when policy value was last updated
                      // the frequency of transactions is a lot higher on life products, so the
                      // effective date shows when the last transaction occurred
                      // for annuity products, we just show current date
                      // (decision documented in CUI-512)
                      dataTimestamp={
                        policy.lineOfBusiness === LineOfBusiness.ANNUITY
                          ? new Date().toISOString()
                          : policy.effectiveDate
                      }
                      lineOfBusiness={policy.lineOfBusiness}
                    />,
                  ]}
                >
                  Account value
                </Label>
              }
            >
              {formatUSDollars(policy.totalFundValue)}
            </FieldData>
            {policy.lineOfBusiness === LineOfBusiness.LIFE && (
              <FieldData
                className="typography-content-body-sm-bold"
                Label={
                  <Label
                    interactiveElements={[
                      <CoveragePopover key="coverage-popover" />,
                    ]}
                  >
                    Coverage
                  </Label>
                }
              >
                {formatUSDollars(policy.totalCoverageAmount)}
              </FieldData>
            )}
            {policy.lineOfBusiness === LineOfBusiness.ANNUITY && (
              <FieldData
                className="typography-content-body-sm-bold"
                Label={
                  <Label
                    interactiveElements={[
                      <LabelPopover title="Death Benefit">
                        <div className={styles.popoverContent}>
                          <p>
                            This is how much money your beneficiaries may
                            receive when you die.
                          </p>
                        </div>
                      </LabelPopover>,
                    ]}
                  >
                    Death Benefit
                  </Label>
                }
              >
                {formatUSDollars(policy.cumulativeGrossDeathBenefitAmount)}
              </FieldData>
            )}
          </div>
        </div>
      </ClickableCardContainer.LinkContent>
    </ClickableCardContainer>
  );
};
