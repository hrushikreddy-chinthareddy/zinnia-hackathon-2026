'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Address, LineOfBusiness } from '@zinnia/api-types/types/sor';
import { FC, useRef } from 'react';

import { actionLogInfo } from '@/actions/log-actions';
import { OpenTransactionCaseDetails } from '@/components/open-transaction-case-details/OpenTransactionCaseDetails';
import { getPolicyProfile } from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { PropertyKeys, useBpmStore } from '@/store/store';
import { CaseSummary, CaseTypes } from '@/types/case';
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
  initialCaseData?: CaseSummary[];
  lineOfBusiness?: LineOfBusiness;
}

const POLL_INTERVAL = 1000;
const POLL_LIMIT = 5;

export const AddressList: FC<AddressListProps> = ({
  planCode,
  policyNumber,
  initialProfileData,
  allowAddressChanges,
  initialCaseData,
  lineOfBusiness,
}) => {
  const bpmAction = useBpmStore(state => state.bpmAction);
  const pollCount = useRef(0);
  const removeBpmAction = useBpmStore(state => state.removeBpmAction);
  const queryClient = useQueryClient();

  const logHandler = () => {
    actionLogInfo('Address poll limit reached', {
      policyNumber,
      planCode,
      message: `After ${pollCount.current} times, we were unable to find changes submitted to the address list. This could mean that it failed to reach Zahara from BPM, or something happened on the Zahara side that would prevent it from returning within ${(POLL_LIMIT * POLL_INTERVAL) / 1000} seconds. This could also mean that it was successful sometime after ${(POLL_LIMIT * POLL_INTERVAL) / 1000} seconds.`,
      actionType: bpmAction?.actionType,
    });
  };

  const { data: addresses } = useQuery({
    queryKey: [QueryKeys.POLICY_PROFILE, 'addresses', policyNumber],
    refetchInterval: ({ state }) => {
      const addresses = filterItemsWithPastEndDate(state.data?.addresses);
      return refetchHandler({
        data: addresses,
        bpmAction,
        propertyKey: PropertyKeys.ADDRESSES,
        logHandler,
        finishedHandler: async () => {
          queryClient.refetchQueries({
            queryKey: [QueryKeys.CASES_FOR_POLICY, policyNumber],
          });
          removeBpmAction();
        },
        pollCount,
      });
    },
    initialData: initialProfileData,
    queryFn: () => getPolicyProfile(planCode, policyNumber),
    select: data => filterItemsWithPastEndDate(data?.addresses),
  });

  return (
    <div>
      <h2 className="mb-lg" id="addAddressSection">
        Address
      </h2>
      {allowAddressChanges && (
        <OpenTransactionCaseDetails
          cases={initialCaseData}
          planCode={planCode}
          policyNumber={policyNumber}
          lineOfBusiness={lineOfBusiness}
          caseType={CaseTypes.ADDRESS_CHANGE}
        />
      )}
      <Addresses
        addresses={addresses as Address[]}
        partyId={initialProfileData?.partyId || ''}
        allowAddressChanges={allowAddressChanges}
      />
      {allowAddressChanges && (
        <AddEditAddressSidesheet
          partyId={initialProfileData?.partyId || ''}
          actionType={FormActionType.ADD}
        />
      )}
    </div>
  );
};
