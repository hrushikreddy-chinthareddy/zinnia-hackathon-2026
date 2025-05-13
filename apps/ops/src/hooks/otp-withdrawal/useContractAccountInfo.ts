import { useEffect, useState } from 'react';

import { FASTQualTypes } from '@deps/models/case/withdrawal/case';
import { searchPolicy } from '@deps/queries/api/policies';

type ContractAccountInfo = {
    qualType: FASTQualTypes | '';
    issueState: string | '';
    issueDate: string | '';
    contractStatus: string | '';
    planCode: string | '';
};

export const useContractAccountInfo = (contract: string, clientId: string): ContractAccountInfo => {
    const [qualType, setQualType] = useState<FASTQualTypes | ''>('');
    const [issueState, setIssueState] = useState<string | ''>('');
    const [issueDate, setIssueDate] = useState<string | ''>('');
    const [contractStatus, setContractStatus] = useState<string | ''>('');
    const [planCode, setPlanCode] = useState<string | ''>('');

    useEffect(() => {
        const getDetails = async () => {
            try {
                const searchResults = await searchPolicy({ policyNumber: contract , carrierIds: [clientId.toUpperCase()] }, { limit: 1, offset: 0 });
                const acctInfoResponse = searchResults.results[0];
                setQualType((acctInfoResponse?.qualificationType as FASTQualTypes) || '');
                setIssueState(acctInfoResponse?.issueState || '');
                setIssueDate(acctInfoResponse?.policyDates?.issueDate || '');
                setContractStatus(acctInfoResponse?.policyStatus || '');
                setPlanCode(acctInfoResponse?.product?.planCode || '');
            } catch (e) {
                console.error('getDetails::FAST::Error retrieving account info', e);
            }
      };


      getDetails();
    }, [contract, clientId]);

    return { qualType, issueState, issueDate, contractStatus, planCode };
};
