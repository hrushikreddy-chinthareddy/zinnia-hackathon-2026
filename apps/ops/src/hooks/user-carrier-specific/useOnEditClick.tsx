import { CarrierName } from '@zinnia/bloom/components';
import { useCallback } from 'react';

import { Party } from '@zinnia/api-types/types/sor';

import useUserCarrier from './useUserCarrier';

type Callback<T = void> = T extends void ? () => void : (args: T) => void;

/**
 * Handles client-specific logic for when a farmers user clicks
 * the "add" or "edit" button for an email or phone or comms pref change belonging to a person with an ecn
 *
 * @param defaultCallback The default callback to use when the user is not a farmers user or the person does not have an ecn
 * @param party The party a user is trying to edit
 * @returns A callback that handles client-specific logic for when a farmers user clicks
 */
export default function useAddOrEditPhoneOrEmailClick<T = void>({
    defaultCallback,
    party,
}: {
    defaultCallback: Callback<T>;
    party: Party | undefined;
}) {
    const userCarrier = useUserCarrier();

    return useCallback(
        (args: T) => {
            const farmersCustomerNumber = party?.identifications?.find(
                (id) => id.identificationKey?.toLowerCase() === 'ecn'
            )?.identificationValue;
            if (userCarrier === CarrierName.FARMERS && farmersCustomerNumber) {
                const url = `${process.env.NEXT_PUBLIC_FARMERS_APEX_REDIRECT_URL}?c__ecn=${farmersCustomerNumber}`;
                window.open(url, '_blank');
            } else {
                defaultCallback(args);
            }
        },
        [userCarrier, defaultCallback, party]
    );
}
