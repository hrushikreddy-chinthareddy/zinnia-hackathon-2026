import { useEffect, useState } from 'react';

import { QualTypes } from '@deps/models/case/withdrawal/case';
import { getPolicyAccountInfo } from '@deps/queries/api/policies';

type UserAccountInfo = {
    qualType: QualTypes | '';
    issueState: string | '';
    issueDate: string | '';
    contractStatus: string | '';
    planCode: string | '';
};

export const useAccountInfo = (
    contract: string,
    clientId: string
): UserAccountInfo => {
    const [qualType, setQualType] = useState<QualTypes | ''>('');
    const [issueState, setIssueState] = useState<string | ''>('');
    const [issueDate, setIssueDate] = useState<string | ''>('');
    const [contractStatus, setContractStatus] = useState<string | ''>('');
    const [planCode, setPlanCode] = useState<string | ''>('');

    useEffect(() => {
        const getFundsList = async () => {
            try {
                const acctInfoResponse = await getPolicyAccountInfo(
                    contract,
                    clientId
                );
                setQualType(
                    (acctInfoResponse?.QualTypeDesc as QualTypes) || ''
                );
                setIssueState(acctInfoResponse?.IssueState || '');
                setIssueDate(acctInfoResponse?.IssueDate || '');
                setContractStatus(acctInfoResponse?.ContractStatus || '');
                setPlanCode(acctInfoResponse?.PlanCode || '');
            } catch (e) {
                console.error(
                    'QualificationType::Error retrieving account info',
                    e
                );
            }
        };

        getFundsList();
    }, [contract, clientId]);

    return { qualType, issueState, issueDate, contractStatus, planCode };
};
