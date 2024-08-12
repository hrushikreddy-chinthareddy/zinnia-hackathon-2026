'use client';

import { useQuery } from '@tanstack/react-query';
import { FC, useRef } from 'react';

import { getPolicyProfile } from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { useBpmStore } from '@/store/store';
import { PolicyProfile } from '@/types/policy';
import { shouldStopBankPolling } from '@/utils/policy';

import styles from './BankList.module.css';
import { AddEditBankSidesheet } from '../add-edit-bank/AddEditBankSidesheet';
import { FormMode } from '../add-edit-bank/shared-types';
import { BankData } from '../bank-data/BankData';

const POLL_INTERVAL = 1000;
const POLL_LIMIT = 5;

interface BankListProps {
  planCode: string;
  policyNumber: string;
  showAddEditBank: boolean;
  initialProfileData?: PolicyProfile | null;
}

export const BankList: FC<BankListProps> = ({
  planCode,
  policyNumber,
  showAddEditBank,
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
          editBankEnabled={showAddEditBank}
          numberOfAccounts={data.bankDetails.length}
          {...bankDetail}
        />
      );
    });

    if (allBankData) {
      return (
        <div>
          <h2 className="mb-lg">Banking Details</h2>
          <div className={styles.multipleItemsInSection}>{allBankData}</div>
          {showAddEditBank && (
            <AddEditBankSidesheet mode={FormMode.ADD} partyId={data.partyId} />
          )}
        </div>
      );
    }
  }

  return null;
};
