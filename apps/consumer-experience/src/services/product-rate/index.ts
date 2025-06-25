// DOCUMENTATION ABOUT THIS API https://zinnia.atlassian.net/wiki/spaces/LPS/pages/3818750009/Product-Rate+Service

import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { logError } from '@/utils/logging/log-fns';

import { productRateBaseUrl } from '../api-config';
import { EnterpriseTokenApi } from '../enterprise-api-token-http';

// TODO: update the name and structure of this
export enum ConfiguredSettingId {
  BorrowingInterestRate = 'pBorrIntRate',
  CurrentInterestRate = 'pCurrIntRate',
  LoanInterestRate = 'pLoanIntRateArr',
  MatchRate = 'rMatchPct',
  ONE_TIME_PREMIUM_PAYMENT_CURR_FEE = 'pInitCurrPremLoad',
  ONE_TIME_PREMIUM_PAYMENT_GUAR_FEE = 'pInitGuarPremLoad',
}

/**
 * Retrieves a list of configured item codes for a given product benefit.
 * Each product will have a specific list of 'resources' or 'configured items'
 * or 'configured settings' (they're referred to as multiple things)
 *
 * @param {Object} options - The options for retrieving the configured item codes.
 * @param {string} options.carrierId - The ID of the carrier.
 * @param {string} options.planCode - The code of the plan.
 * @param {string} options.benefitId - The ID of the benefit.
 * @returns {Promise<string[]>} A promise that resolves to an array of configured item codes.
 * @throws {Error} If there is an error fetching the list of configured item codes.
 */
export const getListOfConfiguredItemsForProductBenefit = async ({
  carrierId,
  planCode,
  benefitId,
  // TODO: are there types for these?
}: {
  carrierId: string;
  planCode: string;
  benefitId: string;
}): Promise<ConfiguredSettingId[]> => {
  const url = `${productRateBaseUrl}/${carrierId}/products/${planCode}/benefits/${benefitId}/configured-settings`;

  const rawResponse = await EnterpriseTokenApi.get(url);

  const response = await parseAPIResponse(rawResponse);

  if (!rawResponse?.ok) {
    logError(
      `Error fetching list of configured item codes for ${carrierId} ${planCode}`,
      await logApiNotOkDetails({ rawResponse, parsedResponse: response })
    );

    throw new Error(
      `Error fetching list of configured item codes for ${carrierId} ${planCode}`,
      { cause: response.status }
    );
  }

  return response;
};

/**
 * Retrieves the details of a configured setting for a product benefit.
 *
 * @param {Object} options - The options for retrieving the configured setting details.
 * @param {string} options.carrierCode - The code of the carrier.
 * @param {string} options.planCode - The code of the plan.
 * @param {ConfiguredSettingId} options.resource - The ID of the configured setting.
 * @param {string} options.benefit_id - The ID of the benefit.
 * @param {string} [options.qsps] - Optional query string parameters.
 * @returns {Promise<any>} A promise that resolves to the configured setting details.
 * @throws {Error} If there is an error fetching the configured setting details.
 */
export const getProductBenefitConfiguredSettingsDetails = async ({
  carrierCode,
  planCode,
  resource,
  benefit_id,
  qsps,
}: {
  carrierCode: string;
  planCode: string;
  resource: ConfiguredSettingId;
  benefit_id: string;
  qsps?: string;
}) => {
  // TODO: qsps = query string params?
  // does the fees request need any of that?
  const url = `${productRateBaseUrl}/${carrierCode}/products/${planCode}/benefits/${benefit_id}/configured-settings/${resource}?${qsps}`;

  const rawResponse = await EnterpriseTokenApi.get(url);

  const response = await parseAPIResponse(rawResponse);

  if (!rawResponse?.ok) {
    logError(
      `Error fetching configured setting details for ${carrierCode} - ${planCode} -  ${benefit_id} - ${resource}`,
      await logApiNotOkDetails({ rawResponse, parsedResponse: response })
    );

    throw new Error('Error fetching policy references');
  }

  return response;
};

export const carrierProductHasConfiguredItem = async ({
  configuredItemCode,
  carrierId,
  planCode,
  benefitId,
}: {
  configuredItemCode: ConfiguredSettingId;
  carrierId: string;
  planCode: string;
  benefitId: string;
}) => {
  const benefitList = await getListOfConfiguredItemsForProductBenefit({
    carrierId: carrierId,
    planCode: planCode,
    benefitId: benefitId,
  });

  return benefitList.includes(configuredItemCode);
};

// TODO: is this fee only for one time payments? or how else to name this?
export const getCarrierProductOneTimePaymentFee = async ({
  configuredItemCode,
  carrierId,
  planCode,
  benefitId,
}: {
  configuredItemCode: ConfiguredSettingId;
  carrierId: string;
  planCode: string;
  benefitId: string;
}) => {
  let fee = 0;
  let hasFeelValSetting = false;

  try {
    // First we need to see if the carrier has the configured item since only
    // some products have certain configured codes, if a product doesn't
    // have the configured item we know it doesn't have a fee
    hasFeelValSetting = await carrierProductHasConfiguredItem({
      configuredItemCode,
      carrierId,
      planCode,
      benefitId,
    });
  } catch (error) {
    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getCarrierProductOneTimePaymentFee error',
      },
    };
  }

  if (hasFeelValSetting) {
    try {
      const feeDetails = await getProductBenefitConfiguredSettingsDetails({
        carrierCode: carrierId,
        planCode,
        resource: configuredItemCode,
        benefit_id: benefitId,
      });
      const feeKey = Object.keys(feeDetails?.effectiveDate)[0] || '';

      // TODO: this feels incredibly brittle. effectiveDate comes back as an object
      // but not sure where the key comes from (tried making call to /versions and there wasn't a match)
      // or when it might have more than one item
      // it's also confusing that this says 'ages' but it's to retreive a fee value
      // i'm also not sure if we can always guarantee that it will directly represent a
      // percentage, but this is what we have right now https://se2llc-global.slack.com/archives/C04N0DSKKNW/p1722471223768029
      fee = feeDetails?.effectiveDate[feeKey][0].ages.All[0];
    } catch (error) {
      return {
        data: null,
        error: {
          message: 'Something went wrong',
          status: 500,
          name: 'getCarrierProductOneTimePaymentFee error',
        },
      };
    }
  }

  return {
    data: {
      fee,
    },
    error: null,
  };
};
