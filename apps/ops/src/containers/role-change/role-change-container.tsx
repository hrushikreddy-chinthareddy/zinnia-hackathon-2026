import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo } from 'react';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import StartStep, {
    StartStepSetState,
    StartType,
} from '@deps/components/workflows/start-step/start-step';
import { TranslationFiles } from '@deps/config/translations';
import { PolicyRole, RoleLabel, SourceType } from '@deps/constants/policy';
import { useRoleChange } from '@deps/contexts/RoleChangeContext';
import { Processes } from '@deps/models/case/case';
import { DEFAULT_STEP_WIDTH } from '@deps/types/constants';
import { TransactionStep } from '@deps/types/segment-analytics';
import { PartyRole, Policy, SchemaEnum } from '@zinnia/api-types/types/sor';

import { buildSignatures, getActiveRoleParty } from './role-change-helper';
import { Step } from '../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import WorkflowContainer from '../workflow-container/workflow-container';
import BeneDetailsStep from './steps/bene-details/bene-details-step';
import ConfirmStep from './steps/confirm/confirm-step';
import RoleDetailsStep from './steps/role-details/role-details-step';
import SignatureStep from './steps/signature/signature-step';
import SummaryStep from './steps/summary/summary-step';

interface RoleChangeContainerProps {
    policy: Policy;
    role: PolicyRole;
    roleLabel: RoleLabel;
}

const RoleChangeContainer = ({
    policy,
    role,
    roleLabel,
}: RoleChangeContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'roleChange',
    });

    const { roleData, setRoleData, setExistingRoleData } = useRoleChange();

    const { policyNumber, product } = policy;
    const planCode = product?.planCode;
    const searchParams = useSearchParams();
    const correlationId = searchParams.get('correlationId');
    const leaveTransactionLink = `/policies/${planCode}/${policyNumber}/${ParentPage.People}`;

    useEffect(() => {
        if (setExistingRoleData) {
            getActiveRoleParty(
                policy,
                setExistingRoleData,
                role.toUpperCase() as PartyRole
            );
        }
        setRoleData((prev: any) => ({
            ...prev,
            signatures: buildSignatures(
                policy,
                role.toUpperCase() as PartyRole
            ),
        }));
    }, [
        policy?.parties,
        policy?.partyRoles,
        role,
        setExistingRoleData,
        setRoleData,
    ]);

    const getProcessSubType = () => {
        if (role === PolicyRole.PAYOR) {
            return [Processes.PayorChange];
        } else if (
            role === PolicyRole.OWNER ||
            role === PolicyRole.JOINTOWNER
        ) {
            return [Processes.OwnerChange];
        } else if (role === PolicyRole.THIRDPARTYDESIGNEE) {
            return [Processes.ThirdPartyDesigneeChange];
        } else {
            return [];
        }
    };

    const steps = useMemo(
        () => [
            {
                ariaLabel: t('tabs.start'),
                component: (
                    <StartStep
                        parentPage={ParentPage.People}
                        processType={Processes.PolicyUpdate}
                        processSubType={getProcessSubType()}
                        policy={policy}
                        correlationId={correlationId || ''}
                        setState={setRoleData as StartStepSetState}
                        state={roleData as StartType}
                        title={t('start.title', { roleLabel }) as string}
                        subtitle={'' as string}
                        trackEventProps={{
                            type: SchemaEnum.ADD_OWNER,
                            step: TransactionStep.Start,
                        }}
                        type={SourceType.Case}
                    />
                ),
                screenReaderLabel: t('tabs.start'),
                text: t('tabs.start'),
                isVisible: () => true,
            },
            {
                ariaLabel: t('tabs.roleDetails', { roleLabel }),
                isVisible: () => true,
                component: (
                    <RoleDetailsStep
                        policy={policy}
                        role={role}
                        roleLabel={roleLabel}
                        leaveTransactionLink={leaveTransactionLink}
                    />
                ),
                screenReaderLabel: t('tabs.roleDetails', { roleLabel }),
                text: t('tabs.roleDetails', { roleLabel }),
            },
            {
                ariaLabel: t('tabs.beneDetails'),
                isVisible: () =>
                    role === PolicyRole.PAYOR ||
                    role === PolicyRole.THIRDPARTYDESIGNEE
                        ? false
                        : true,
                component: (
                    <BeneDetailsStep
                        policy={policy}
                        role={role}
                        leaveTransactionLink={leaveTransactionLink}
                    />
                ),
                screenReaderLabel: t('tabs.beneDetails'),
                text: t('tabs.beneDetails'),
            },
            {
                ariaLabel: t('tabs.signature'),
                isVisible: () => true,
                component: (
                    <SignatureStep
                        policy={policy}
                        role={role}
                        leaveTransactionLink={leaveTransactionLink}
                    />
                ),
                screenReaderLabel: t('tabs.signature'),
                text: t('tabs.signature'),
            },
            {
                ariaLabel: t('tabs.summary'),
                isVisible: () => true,
                component: (
                    <SummaryStep
                        policy={policy}
                        role={role}
                        roleLabel={roleLabel}
                        leaveTransactionLink={leaveTransactionLink}
                    />
                ),
                screenReaderLabel: t('tabs.summary'),
                text: t('tabs.summary'),
            },
            {
                ariaLabel: t('tabs.confirm'),
                isVisible: () => true,
                component: (
                    <ConfirmStep
                        policy={policy}
                        role={role}
                        roleLabel={roleLabel}
                        leaveTransactionLink={leaveTransactionLink}
                    />
                ),
                screenReaderLabel: t('tabs.confirm'),
                text: t('tabs.confirm'),
            },
        ],
        [roleData.caseId]
    );

    const filteredSteps: Step[] = useMemo(
        () =>
            steps
                .filter((item: any) => item.isVisible?.())
                .map((item: any, index: number) => ({ ...item, index })),
        [steps]
    );

    return (
        <WorkflowContainer
            policy={policy}
            steps={filteredSteps}
            stepWidth={DEFAULT_STEP_WIDTH}
        />
    );
};

export default RoleChangeContainer;
