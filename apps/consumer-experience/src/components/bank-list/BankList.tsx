'use client';

import { useQuery } from '@tanstack/react-query';
import { FC, useRef } from 'react';

import { actionLogInfo } from '@/actions/log-actions';
import { getPolicyProfile } from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { useBpmStore } from '@/store/store';
import { PolicyProfile } from '@/types/policy';
import { shouldStopBankPolling } from '@/utils/policy';

import styles from './BankList.module.css';
import { AddBankSidesheet } from '../add-bank/AddBankSidesheet';
import { BankData } from '../bank-data/BankData';
import { CarrierPhoneNumber } from '../carrier-phone-number/CarrierPhoneNumber';

const POLL_INTERVAL = 1000;
const POLL_LIMIT = 5;

interface BankListProps {
  planCode: string;
  policyNumber: string;
  allowBankingChanges: boolean;
  initialProfileData?: PolicyProfile | null;
}

export const BankList: FC<BankListProps> = ({
  planCode,
  policyNumber,
  allowBankingChanges,
  initialProfileData,
}) => {
  const bpmAction = useBpmStore(state => state.bpmAction);
  const pollCount = useRef(0);
  const removeBpmAction = useBpmStore(state => state.removeBpmAction);
  const { data } = useQuery({
    queryKey: [QueryKeys.POLICY_PROFILE],
    refetchInterval: ({ state }) => {
      if (
        shouldStopBankPolling(state.data, bpmAction) ||
        pollCount.current >= POLL_LIMIT
      ) {
        // if pollCount has reached the limit and there is no change to the data, send a log
        if (
          !shouldStopBankPolling(state.data, bpmAction) &&
          pollCount.current >= POLL_LIMIT
        ) {
          actionLogInfo('BankList poll limit reached', {
            policyNumber,
            planCode,
            message: `After ${pollCount.current} times, we were unable to find changes submitted to the bank list. This could mean that it failed to reach Zahara from BPM, or something happened on the Zahara side that would prevent it from returning within ${(POLL_LIMIT * POLL_INTERVAL) / 1000} seconds. This could also mean that it was successful sometime after ${(POLL_LIMIT * POLL_INTERVAL) / 1000} seconds.`,
            actionType: bpmAction?.actionType,
          });
        }
        if (bpmAction) {
          removeBpmAction();
        }

        pollCount.current = 0;
        return false;
      }
      pollCount.current++;
      return POLL_INTERVAL;
    },
    initialData: initialProfileData,
    queryFn: () => getPolicyProfile(planCode, policyNumber),
  });

  if (data?.bankDetails && data.bankDetails.length) {
    const allBankData = data.bankDetails.map(bankDetail => {
      return (
        <BankData
          key={bankDetail.accountNumber}
          partyId={bankDetail.appliesToPartyId || ''}
          removeBankEnabled={allowBankingChanges}
          numberOfAccounts={data.bankDetails.length}
          {...bankDetail}
        />
      );
    });

    if (allBankData) {
      return (
        <div>
          <h2 id="addBankSection" className="mb-lg">
            Banking Details
          </h2>
          <p className="mb-lg">
            Need help updating banking details? Give us a call at{' '}
            <CarrierPhoneNumber />.
          </p>
          <div className={styles.multipleItemsInSection}>{allBankData}</div>
          {allowBankingChanges && (
            <AddBankSidesheet
              partyId={data.partyId}
              policyOwner={`${initialProfileData?.name.firstName} ${initialProfileData?.name.lastName}`}
            />
          )}
        </div>
      );
    }
  }

  return null;
};
