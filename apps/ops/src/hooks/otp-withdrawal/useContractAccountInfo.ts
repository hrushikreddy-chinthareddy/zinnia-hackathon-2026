import { useEffect, useState } from 'react';

import { FASTQualTypes, QualTypes } from '@deps/models/case/withdrawal/case';
import { fetchPolicy, getPolicyAccountInfo } from '@deps/queries/api/policies';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

type ContractAccountInfo = {
    qualType: FASTQualTypes | QualTypes | '';
    issueState: string | '';
    issueDate: string | '';
    contractStatus: string | '';
    planCode: string | '';
};

export const useContractAccountInfo = (
    contract: string,
    policyPlanCode: string,
    clientCode: string,
    isLC: boolean
): ContractAccountInfo => {
    const [qualType, setQualType] = useState<FASTQualTypes | QualTypes | ''>(
        ''
    );
    const [issueState, setIssueState] = useState<string | ''>('');
    const [issueDate, setIssueDate] = useState<string | ''>('');
    const [contractStatus, setContractStatus] = useState<string | ''>('');
    const [planCode, setPlanCode] = useState<string | ''>(policyPlanCode || '');

    useEffect(() => {
        const getEnterprisePolicyDetails = async () => {
            try {
                const acctInfoResponse = await fetchPolicy(
                    contract,
                    policyPlanCode
                );
                setQualType(
                    (acctInfoResponse?.qualificationType as unknown as FASTQualTypes) ||
                        ''
                ); // BPB - Assuming FAST isn't in here yet, so this is a temporary fix
                setIssueState(acctInfoResponse?.issueState || '');
                setIssueDate(acctInfoResponse?.policyDates?.issueDate || '');
                setContractStatus(acctInfoResponse?.policyStatus || '');
                browserLogInfo(
                    'useContractAccountInfo::getEnterprisePolicyDetails::Retrieved account info',
                    {
                        policyNumber: contract,
                        planCode: policyPlanCode,
                        isLC,
                        file: 'useContractAccountInfo',
                    }
                );
            } catch (e) {
                browserLogError(
                    'useContractAccountInfo::getEnterprisePolicyDetails::Error retrieving account info',
                    {
                        ...parseErrorInformation(e),
                        policyNumber: contract,
                        planCode: policyPlanCode,
                        isLC,
                        file: 'useContractAccountInfo',
                    }
                );
            }
        };

        const getLCPolicyDetails = async () => {
            try {
                const acctInfoResponse = await getPolicyAccountInfo(
                    contract,
                    clientCode
                );
                setQualType(
                    (acctInfoResponse?.QualTypeDesc as QualTypes) || ''
                );
                setIssueState(acctInfoResponse?.IssueState || '');
                setIssueDate(acctInfoResponse?.IssueDate || '');
                setContractStatus(acctInfoResponse?.ContractStatus || '');
                setPlanCode(acctInfoResponse?.PlanCode || '');
                browserLogInfo(
                    'useContractAccountInfo::getLCPolicyDetails::Retrieved account info',
                    {
                        policyNumber: contract,
                        clientCode: clientCode,
                        isLC,
                        file: 'useContractAccountInfo',
                    }
                );
            } catch (e) {
                browserLogError(
                    'useContractAccountInfo::getLCPolicyDetails::Error retrieving account info',
                    {
                        ...parseErrorInformation(e),
                        policyNumber: contract,
                        clientCode: clientCode,
                        isLC,
                        file: 'useContractAccountInfo',
                    }
                );
            }
        };

        isLC ? getLCPolicyDetails() : getEnterprisePolicyDetails();
    }, [contract, policyPlanCode, clientCode, isLC]);

    return { qualType, issueState, issueDate, contractStatus, planCode };
};
