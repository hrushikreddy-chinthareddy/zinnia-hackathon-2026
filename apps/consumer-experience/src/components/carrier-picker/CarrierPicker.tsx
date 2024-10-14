import { CarrierPolicyDetails } from '@/types/policy';
import { SearchParams } from '@/types/url';
import { getCarrierListDetails } from '@/utils/carriers';

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
  searchParams,
}: {
  policies: CarrierPolicyDetails[];
  searchParams: SearchParams;
}) => {
  const carrierListDetails = getCarrierListDetails(policies);
  const params = new URLSearchParams(searchParams).toString();

  return (
    <div className={styles.carrierPicker}>
      {carrierListDetails.map(({ carrierName, displayText, link }) => {
        return (
          <ClickableCardContainer key={carrierName}>
            <ClickableCardContainer.LinkContent
              linkTo={{
                label: carrierName,
                url: `${link.href}/coverage${params ? `?${params}` : ''}`,
                isInternal: true,
              }}
            >
              {carrierName} {displayText}
            </ClickableCardContainer.LinkContent>
          </ClickableCardContainer>
        );
      })}
    </div>
  );
};
