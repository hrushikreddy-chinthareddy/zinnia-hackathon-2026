'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { FC, useMemo, useRef } from 'react';

import { actionLogInfo } from '@/actions/log-actions';
import { getPolicyProfile } from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { PropertyKeys, useBpmStore } from '@/store/store';
import { CaseSummary, CaseTypes } from '@/types/case';
import { PolicyProfile } from '@/types/policy';
import { refetchHandler } from '@/utils/transactions';

import styles from './BankList.module.css';
import { AddBankSidesheet } from '../add-bank/AddBankSidesheet';
import { BankData } from '../bank-data/BankData';
import { CarrierPhoneNumber } from '../carrier-phone-number/CarrierPhoneNumber';
import { OpenTransactionCaseDetails } from '../open-transaction-case-details/OpenTransactionCaseDetails';

const POLL_INTERVAL = 1000;
const POLL_LIMIT = 5;

interface BankListProps {
  planCode: string;
  policyNumber: string;
  allowBankingChanges: boolean;
  initialProfileData?: PolicyProfile | null;
  initialCaseData?: CaseSummary[];
  lineOfBusiness?: LineOfBusiness;
}

export const BankList: FC<BankListProps> = ({
  planCode,
  policyNumber,
  allowBankingChanges,
  initialProfileData,
  initialCaseData,
  lineOfBusiness,
}) => {
  const bpmAction = useBpmStore(state => state.bpmAction);
  const pollCount = useRef(0);
  const removeBpmAction = useBpmStore(state => state.removeBpmAction);
  const queryClient = useQueryClient();

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

  const allBankData = useMemo(() => {
    return data?.map(bankDetail => {
      return (
        <BankData
          key={bankDetail.accountNumber}
          partyId={bankDetail.appliesToPartyId || ''}
          removeBankEnabled={allowBankingChanges}
          numberOfAccounts={data.length}
          {...bankDetail}
        />
      );
    });
  }, [allowBankingChanges, data]);

  return (
    <div>
      <h2 id="addBankSection" className="mb-lg">
        Banking Details
      </h2>

      {data && !!data.length && (
        <>
          <p className="mb-lg">
            Need help updating banking details? Give us a call at{' '}
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

      {allowBankingChanges && (
        <AddBankSidesheet
          partyId={initialProfileData?.partyId || ''}
          policyOwner={`${initialProfileData?.name.firstName} ${initialProfileData?.name.lastName}`}
        />
      )}
    </div>
  );
};
