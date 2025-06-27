import {
    Policy as OpsPolicy,
    Policy,
    LineOfBusiness,
    ProductType,
} from '@zinnia/api-types/types/sor';

import {
    AnnuityViewDetailsDto,
    toAnnuityViewDetailsDto,
} from './annuity-details-view';
import {
    PolicyViewDetailsDto,
    toPolicyViewDetailsDto,
    toTermLifeViewDetailsDto,
} from './policy-details-view';

/**
 *
 * Depending on if a product is a life or annuity, we need to return a different data set
 */
export const generatePolicyAnnuityDetailsDto = (
    policy: OpsPolicy
): PolicyViewDetailsDto | AnnuityViewDetailsDto => {
    if (!policy) return {} as PolicyViewDetailsDto;
    if (policy.product?.lineOfBusiness === LineOfBusiness.LIFE) {
        if (isTermLifeProduct(policy)) {
            return toTermLifeViewDetailsDto(policy) as PolicyViewDetailsDto;
        }
        return toPolicyViewDetailsDto(policy);
    } else {
        //TODO: When we update to use the api-types all over the app, remove the type casting
        return toAnnuityViewDetailsDto(policy as Policy);
    }
};
export const isTermLifeProduct = (policy: OpsPolicy): boolean => {
    const productType = policy.product?.productType || '';
    return productType === ProductType.TERM;
};
