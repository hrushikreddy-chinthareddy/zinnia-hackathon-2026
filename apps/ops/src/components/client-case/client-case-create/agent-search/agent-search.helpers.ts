import { uniqBy } from 'lodash';

import { IllustrationAgentDetails } from '@deps/types/illustrations';
import { GetDownlineResponse } from '@deps/types/producers';

export const getAgentsFromDownline = (
    downlinesArray: GetDownlineResponse[][][]
): IllustrationAgentDetails[] => {
    const flatDownlinesArray = uniqBy(
        downlinesArray
            .flatMap((downlineArray) => downlineArray)
            .flatMap((downline) => downline)
            .map((downline) => ({
                firstName: downline.firstName,
                lastName: downline.lastName,
                sellingCode: downline.sellingCode,
                npn: downline.npn,
                email: downline.emailAddress,
            })),
        'sellingCode'
    );

    return flatDownlinesArray;
};
