import { groupBy, lowerCase } from 'lodash';

import { ApiGetProducerResponse } from '@deps/types/pom/get.types';
import { GetDownlineResponse } from '@deps/types/producers';

import { DelegatedAgent } from './types';

/*
 * Checks if a `DelegatedAgent` name matches a value
 */
export const hasPartialFullName = (
    partialFullName: string,
    { firstName, middleName, lastName }: DelegatedAgent
) =>
    [
        [firstName],
        [lastName],
        [firstName, lastName],
        [firstName, middleName, lastName],
    ].some((segments) =>
        segments
            .filter((str): str is string => str != null)
            .map(lowerCase)
            .join(' ')
            .includes(partialFullName.toLowerCase())
    );

/*
 * Map a downline into `DelegatedAgent[]`
 */
export const buildAgentsFromDownline = (
    downline: GetDownlineResponse[][],
    { carrierShortName }: { carrierShortName: string }
): DelegatedAgent[] =>
    Object.entries(groupBy(downline.flat(), 'npn')).map(([npn, downline]) => {
        const downlineWithDetails = downline.find(
            ({ firstName, lastName, emailAddress }) =>
                firstName && lastName && emailAddress
        );

        return {
            firstName: downlineWithDetails?.firstName,
            lastName: downlineWithDetails?.lastName,
            middleName: '',
            email: downlineWithDetails?.emailAddress,
            npn,
            carrierShortName: carrierShortName,
            sellingCodes: downline
                .map(({ sellingCode }) => sellingCode)
                .filter((sellingCode): sellingCode is string => !!sellingCode),
        };
    });

/*
 * Create an `DelegatedAgent` from a producer object
 */
export const buildAgentFromProducer = (
    {
        firstName,
        middleName,
        lastName,
        email,
        nationalProducerNumber,
    }: ApiGetProducerResponse,
    {
        sellingCode,
        carrierShortName,
    }: { sellingCode: string; carrierShortName: string }
): DelegatedAgent => ({
    firstName: firstName,
    middleName,
    lastName,
    email,
    npn: nationalProducerNumber,
    carrierShortName,
    sellingCodes: [sellingCode],
});
