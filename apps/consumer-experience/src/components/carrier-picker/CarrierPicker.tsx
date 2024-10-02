import { CarrierPolicyDetails } from '@/types/policy';
import {
  getCarrierIdsByName,
  getCarrierIdsFromPolicies,
  getCarrierNamesFromIds,
  getCarrierSubdomainByName,
} from '@/utils/carriers';
import { filterPoliciesByCarrierId } from '@/utils/policy';
import { prependSubdomain } from '@/utils/url';

import styles from './CarrierPicker.module.css';
import { ClickableCardContainer } from '../clickable-card-container/ClickableCardContainer';

/**
 *
 * @param param0
 * @returns
 *
 *  * TODO: This wont be an accurate count for people who have more than 10 policies, because we limit policy search by 10.
 * We should go back and refactor policy search to support this.
 */
export const CarrierPicker = async ({
  policies,
}: {
  policies: CarrierPolicyDetails[];
}) => {
  const carrierIds = getCarrierIdsFromPolicies(policies);
  const carrierNames = getCarrierNamesFromIds(carrierIds);

  return (
    <div className={styles.carrierPicker}>
      {Array.from(carrierNames).map(name => {
        const subdomain = getCarrierSubdomainByName(name);
        const subdomainPath = prependSubdomain(subdomain);
        const carrierIds = getCarrierIdsByName(name);
        const policiesNumber = filterPoliciesByCarrierId(
          policies,
          carrierIds
        ).length;

        return (
          <ClickableCardContainer key={name}>
            <ClickableCardContainer.LinkContent
              linkTo={{
                label: name,
                url: `${subdomainPath}`,
                isInternal: true,
              }}
            >
              {name}{' '}
              {policiesNumber > 1
                ? `(${policiesNumber} policies)`
                : `(${policiesNumber} policy)`}
            </ClickableCardContainer.LinkContent>
          </ClickableCardContainer>
        );
      })}
    </div>
  );
};
