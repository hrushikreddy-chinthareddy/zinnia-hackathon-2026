'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AccountStatus, LineOfBusiness } from '@zinnia/api-types/types/sor';
import { useParams } from 'next/navigation';
import { FC, useMemo, useRef } from 'react';

import { putEndDateBankAccount } from '@/actions/bpm/bank-actions';
import { actionLogInfo } from '@/actions/log-actions';
import { useUser } from '@/hooks/use-user';
import { getPolicyProfile } from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { ActionTypes, PropertyKeys, useBpmStore } from '@/store/store';
import { CaseSummary, CaseTypes } from '@/types/case';
import { PolicyProfile } from '@/types/policy';
import {
  refetchHandler,
  POLL_INTERVAL,
  POLL_LIMIT,
} from '@/utils/transactions';

import styles from './BankList.module.css';
import { AddBankSidesheet } from '../add-bank/AddBankSidesheet';
import { BankData } from '../bank-data/BankData';
import { CarrierPhoneNumber } from '../carrier-phone-number/CarrierPhoneNumber';
import { OpenTransactionCaseDetails } from '../open-transaction-case-details/OpenTransactionCaseDetails';
import { BankDetail } from '../person-data/types';

interface BankListProps {
  planCode: string;
  policyNumber: string;
  initialProfileData?: PolicyProfile | null;
  initialCaseData?: CaseSummary[];
  lineOfBusiness?: LineOfBusiness;
  verifyIdentityRequired?: boolean;
}

export const BankList: FC<BankListProps> = ({
  planCode,
  policyNumber,
  initialProfileData,
  initialCaseData,
  lineOfBusiness,
  verifyIdentityRequired,
}) => {
  const params = useParams<{
    planCode: string;
    policyNumber: string;
  }>();
  const bpmAction = useBpmStore(state => state.bpmAction);
  const updateBpmAction = useBpmStore(state => state.updateBpmAction);

  const pollCount = useRef(0);
  const removeBpmAction = useBpmStore(state => state.removeBpmAction);
  const queryClient = useQueryClient();
  const { user } = useUser();

  const logHandler = () => {
    actionLogInfo('BankList poll limit reached', {
      policyNumber,
      planCode,
      message: `After ${pollCount.current} times, we were unable to find changes submitted to the bank list. This could mean that it failed to reach Zahara from BPM, or something happened on the Zahara side that would prevent it from returning within ${(POLL_LIMIT * POLL_INTERVAL) / 1000} seconds. This could also mean that it was successful sometime after ${(POLL_LIMIT * POLL_INTERVAL) / 1000} seconds.`,
      actionType: bpmAction?.actionType,
    });
  };
  const { data } = useQuery({
    queryKey: [QueryKeys.POLICY_PROFILE, 'banks', policyNumber],
    refetchInterval: ({ state }) => {
      return refetchHandler({
        data: state.data?.bankDetails || [],
        bpmAction,
        propertyKey: PropertyKeys.BANK_DETAILS,
        logHandler,
        finishedHandler: () => {
          removeBpmAction();
          queryClient.refetchQueries({
            queryKey: [QueryKeys.CASES_FOR_POLICY, policyNumber],
          });
        },
        pollCount,
      });
    },
    initialData: initialProfileData,
    queryFn: () => getPolicyProfile(planCode, policyNumber),
    select: data => {
      return data?.bankDetails;
    },
  });

  const handleRemoveBank = useMemo(
    () => async (bankDetail: BankDetail) => {
      const { data, error } = await putEndDateBankAccount({
        planCode: params.planCode,
        policyNumber: params.policyNumber,
        partyId: bankDetail.appliesToPartyId || '',
        bankId: bankDetail.accountNumber,
        bankAccountChangeRequest: {
          bankAccount: {
            accountNumber: bankDetail.accountNumber,
            accountType: bankDetail.accountType,
            routingNumber: bankDetail.routingNumber,
            branchName: bankDetail.branchName,
            accountStatus: AccountStatus.ACTIVEBANKACCOUNT,
            nameOnAccount: user?.name,
          },
        },
      });

      updateBpmAction({
        actionType: ActionTypes.REMOVE,
        propertyKey: PropertyKeys.BANK_DETAILS,
        itemKey: 'routingNumber',
        itemValue: bankDetail.routingNumber,
      });

      return {
        data: {
          title: data?.messages?.title || 'Success',
          message: data?.messages?.message || 'Bank removed',
        },
        error: error || null,
      };
    },
    [params.planCode, params.policyNumber, updateBpmAction, user?.name]
  );

  const allBankData = useMemo(() => {
    return data?.map(bankDetail => {
      return (
        <BankData
          key={bankDetail.accountNumber}
          numberOfAccounts={data.length}
          checkVerification={verifyIdentityRequired}
          onRemoveBank={() => handleRemoveBank(bankDetail)}
          {...bankDetail}
        />
      );
    });
  }, [data, handleRemoveBank, verifyIdentityRequired]);

  return (
    <div>
      <h2 id="addBankSection" className="mb-lg">
        Banking Details
      </h2>

      {data && !!data.length && (
        <>
          <p className="mb-lg">
            Need help changing your autopay bank? Give us a call at{' '}
            <CarrierPhoneNumber />.
          </p>
          <OpenTransactionCaseDetails
            cases={initialCaseData}
            planCode={planCode}
            policyNumber={policyNumber}
            lineOfBusiness={lineOfBusiness}
            caseType={CaseTypes.BANK_INFO_CHANGE}
          />
          <div className={styles.multipleItemsInSection}>{allBankData}</div>
        </>
      )}

      <AddBankSidesheet
        partyId={initialProfileData?.partyId || ''}
        policyOwner={`${initialProfileData?.name.firstName} ${initialProfileData?.name.lastName}`}
      />
    </div>
  );
};
