'use client';

import { useQuery } from '@tanstack/react-query';
import { FC, useEffect } from 'react';

import { getPolicyProfile } from '@/queries/policy-queries';
import { getPolicyProfileData } from '@/services';
import { ClientApi } from '@/services/client-http';
import { PolicyProfile } from '@/types/policy';

import styles from './BankList.module.css';
import { AddEditBankSidesheet } from '../add-edit-bank/AddEditBankSidesheet';
import { FormMode } from '../add-edit-bank/shared-types';
import { BankData } from '../bank-data/BankData';

interface BankListProps {
  planCode: string;
  policyNumber: string;
  showAddEditBank: boolean;
}
export const BankList: FC<BankListProps> = ({
  planCode,
  policyNumber,
  showAddEditBank,
}) => {
  const { data, error } = useQuery({
    queryKey: ['policyProfile'],
    queryFn: () => getPolicyProfile(planCode, policyNumber),
  });

  useEffect(() => {
    console.log({ error });
  }, [error]);
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
