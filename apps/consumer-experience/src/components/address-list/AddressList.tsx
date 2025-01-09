'use client';

import { useQuery } from '@tanstack/react-query';
import { Address } from '@zinnia/api-types/types/sor';
import { FC, useRef } from 'react';

import { actionLogInfo } from '@/actions/log-actions';
import { getPolicyProfile } from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { PropertyKeys, useBpmStore } from '@/store/store';
import { PolicyProfile } from '@/types/policy';
import { filterItemsWithPastEndDate } from '@/utils/data';
import { refetchHandler } from '@/utils/transactions';

import { AddEditAddressSidesheet } from '../add-edit-address/AddEditAddressSidesheet';
import { FormActionType } from '../add-edit-address/types';
import { Addresses } from '../person-data/Addresses';

interface AddressListProps {
  planCode: string;
  policyNumber: string;
  initialProfileData?: PolicyProfile | null;
  allowAddressChanges?: boolean;
}

const POLL_INTERVAL = 1000;
const POLL_LIMIT = 5;

export const AddressList: FC<AddressListProps> = ({
  planCode,
  policyNumber,
  initialProfileData,
  allowAddressChanges,
}) => {
  const bpmAction = useBpmStore(state => state.bpmAction);
  const pollCount = useRef(0);
  const removeBpmAction = useBpmStore(state => state.removeBpmAction);
  const logHandler = () => {
    actionLogInfo('Address poll limit reached', {
      policyNumber,
      planCode,
      message: `After ${pollCount.current} times, we were unable to find changes submitted to the address list. This could mean that it failed to reach Zahara from BPM, or something happened on the Zahara side that would prevent it from returning within ${(POLL_LIMIT * POLL_INTERVAL) / 1000} seconds. This could also mean that it was successful sometime after ${(POLL_LIMIT * POLL_INTERVAL) / 1000} seconds.`,
      actionType: bpmAction?.actionType,
    });
  };
  const { data: addresses } = useQuery({
    queryKey: [QueryKeys.POLICY_PROFILE, 'addresses'],
    refetchInterval: ({ state }) => {
      const addresses = filterItemsWithPastEndDate(state.data?.addresses);
      return refetchHandler({
        data: addresses,
        bpmAction,
        propertyKey: PropertyKeys.ADDRESSES,
        logHandler,
        finishedHandler: () => removeBpmAction(),
        pollCount,
      });
    },
    initialData: initialProfileData,
    queryFn: () => getPolicyProfile(planCode, policyNumber),
    select: data => data?.addresses,
  });

  if (addresses && addresses.length) {
    const currentAddresses = filterItemsWithPastEndDate(addresses);

    if (currentAddresses && currentAddresses.length) {
      return (
        <Addresses
          addresses={currentAddresses as Address[]}
          title="Address"
          preferredAddressIndicator={
            initialProfileData?.preferredAddressIndicator || ''
          }
          partyId={initialProfileData?.partyId || ''}
          allowAddressChanges={allowAddressChanges}
        />
      );
    }
  }

  if (!allowAddressChanges) {
    return null;
  }
  // If there are no addresses, show the add address button and set defaultAddress to true
  return (
    <>
      <h2 className="mb-lg">Addresses</h2>
      <AddEditAddressSidesheet
        values={{ defaultAddress: true }}
        partyId={initialProfileData?.partyId || ''}
        actionType={FormActionType.ADD}
      />
    </>
  );
};
