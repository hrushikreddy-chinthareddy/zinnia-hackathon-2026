import { CarrierPolicyDetails } from '@/types/policy';
import {
  getCarrierIdsByName,
  getCarrierIdsFromPolicies,
  getCarrierNamesFromIds,
  getCarrierSubdomainByName,
} from '@/utils/carriers';
import { filterPoliciesByCarrierId } from '@/utils/policy';
import { setThemeCookies } from '@/utils/theme';

import styles from './CarrierPicker.module.css';
import { ClickableCardContainer } from '../clickable-card-container/ClickableCardContainer';
const updateCookie = async (formData: FormData) => {
  'use server';
  const subdomain = formData.get('subdomain')?.toString();
  const theme = subdomain || '';
  await setThemeCookies(theme);
};

/**
 * This is specifically really only for supporting vercel environments where we dont want to
 * route a user to a subdomain. This will manually set the theme cookie on click and then reload the page.
 *
 * TODO: This wont be an accurate count for people who have more than 10 policies, because we limit policy search by 10.
 * We should go back and refactor policy search to support this.
 */
export const CarrierPickerCookieOnly = async ({
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

        const carrierIds = getCarrierIdsByName(name);
        const policiesNumber = filterPoliciesByCarrierId(
          policies,
          carrierIds
        ).length;
        return (
          <ClickableCardContainer key={name}>
            <ClickableCardContainer.AdditionalContent>
              <form action={updateCookie}>
                <input type="hidden" name="subdomain" value={subdomain} />
                <button className={styles.vercelPickerButton} type="submit">
                  {name}{' '}
                  {policiesNumber > 1
                    ? `(${policiesNumber} policies)`
                    : `(${policiesNumber} policy)`}
                </button>
              </form>
            </ClickableCardContainer.AdditionalContent>
          </ClickableCardContainer>
        );
      })}
    </div>
  );
};
