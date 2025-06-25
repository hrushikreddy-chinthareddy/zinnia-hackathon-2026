import { useEffect, useState } from 'react';

import { FASTQualTypes } from '@deps/models/case/withdrawal/case';
import { fetchPolicy, searchPolicy } from '@deps/queries/api/policies';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

type ContractAccountInfo = {
    qualType: FASTQualTypes | '';
    issueState: string | '';
    issueDate: string | '';
    contractStatus: string | '';
    planCode: string | '';
};

export const useContractAccountInfo = (contract: string, planCode: string): ContractAccountInfo => {
    const [qualType, setQualType] = useState<FASTQualTypes | ''>('');
    const [issueState, setIssueState] = useState<string | ''>('');
    const [issueDate, setIssueDate] = useState<string | ''>('');
    const [contractStatus, setContractStatus] = useState<string | ''>('');

    useEffect(() => {
        const getDetails = async () => {
            try {
                const searchResults = await searchPolicy(
                    { policyNumber: contract, planCode: planCode },
                    { limit: 1, offset: 0 }
                );

                const acctInfoResponse = await fetchPolicy(searchResults.results[0]?.policyNumber, searchResults.results[0]?.planCode);

                setQualType((acctInfoResponse?.qualificationType as unknown as FASTQualTypes) || ''); // BPB - Assuming FAST isn't in here yet, so this is a temporary fix
                setIssueState(acctInfoResponse?.issueState || '');
                setIssueDate(acctInfoResponse?.policyDates?.issueDate || '');
                setContractStatus(acctInfoResponse?.policyStatus || '');
                browserLogInfo('useContractAccountInfo::Retrieved account info', {
                    policyNumber: contract,
                    planCode: planCode,
                    file: 'useContractAccountInfo',
                });
            } catch (e) {
                browserLogError('useContractAccountInfo::Error retrieving account info', {
                    ...parseErrorInformation(e),
                    policyNumber: contract,
                    planCode: planCode,
                    file: 'useContractAccountInfo',
                });
            }
        };

        getDetails();
    }, [contract, planCode]);

    return { qualType, issueState, issueDate, contractStatus, planCode };
};
