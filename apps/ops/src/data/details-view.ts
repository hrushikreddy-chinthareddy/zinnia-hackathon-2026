import { Policy, LineOfBusiness } from '@zinnia/api-types/types/sor';

import { Policy as OpsPolicy } from '@deps/models/policy/sor-policy';

import { AnnuityViewDetailsDto, toAnnuityViewDetailsDto } from './annuity-details-view';
import { PolicyViewDetailsDto, toPolicyViewDetailsDto } from './policy-details-view';

/**
 *
 * Depending on if a product is a life or annuity, we need to return a different data set
 */
export const generatePolicyAnnuityDetailsDto = (policy: OpsPolicy): PolicyViewDetailsDto | AnnuityViewDetailsDto => {
    if (!policy) return {} as PolicyViewDetailsDto;
    if (policy.product?.lineOfBusiness === LineOfBusiness.LIFE) {
        return toPolicyViewDetailsDto(policy);
    } else {
        //TODO: When we update to use the api-types all over the app, remove the type casting
        return toAnnuityViewDetailsDto(policy as Policy);
    }
};
