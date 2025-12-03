import { TFunction } from 'i18next';

import {
    AnnuityDetailsViewInfo,
    AnnuityViewDetailsDto,
} from '@deps/data/annuity-details-view';
import {
    generatePolicyAnnuityDetailsDto,
    isTermLifeProduct,
} from '@deps/data/details-view';
import {
    PolicyDetailsViewInfo,
    PolicyViewDetailsDto,
    TermLifeDetailsViewInfo,
} from '@deps/data/policy-details-view';
import { fillColDefs } from '@deps/helpers/data-transform.helpers';
import { DataDefinition } from '@deps/types/data';
import { Policy, LineOfBusiness } from '@zinnia/api-types/types/sor';

/**
 * Takes in a policy and generates the key values search fields for that policy
 */
export const prepareSearchableData = (policy: Policy, t: TFunction) => {
    const dto = generatePolicyAnnuityDetailsDto(policy);
    const isLifePolicy = policy.product?.lineOfBusiness === LineOfBusiness.LIFE;
    const isTermLife = isLifePolicy && isTermLifeProduct(policy);
    const colDefs = isLifePolicy
        ? isTermLife
            ? TermLifeDetailsViewInfo()
            : PolicyDetailsViewInfo()
        : AnnuityDetailsViewInfo();

    return fillColDefs(dto, colDefs, t, 'colDefs:policyDetails');
};

/**
 * Takes in an array of key values and groups them into an array of objects by group label
 */
export const generateKeyValueGroups = (
    keyValues: DataDefinition<PolicyViewDetailsDto | AnnuityViewDetailsDto>[]
) => {
    const groupedObj = keyValues.reduce(
        (acc: Record<string, any[]>, keyValue) => {
            if (keyValue.groupLabel !== undefined && keyValue.group !== null) {
                if (acc[keyValue.groupLabel]) {
                    acc[keyValue.groupLabel].push(keyValue);
                } else {
                    acc[keyValue.groupLabel] = [keyValue];
                }
            }
            return acc;
        },
        {}
    );

    // Then transform the object into an array of the desired structure
    return Object.entries(groupedObj).map(([groupLabel, items]) => {
        // Find the group value from the first item in the array
        const group = items[0]?.group || '';

        return {
            group,
            groupLabel,
            items,
        };
    });
};
