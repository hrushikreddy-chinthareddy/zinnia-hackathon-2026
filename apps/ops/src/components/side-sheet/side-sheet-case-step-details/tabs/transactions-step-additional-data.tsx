import { CaseAdditionalStepData } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';

import ComplianceDbUpdate from './bene-notification-tab/compliance-db-update/compliance-db-update';
import ClaimsFundRelease from './claims-fund-release/claims-fund-release';
import DeathAuditFiles from './death-audit-files/death-audit-files';
import DeathAuditFilesTab from './death-audit-files/death-audit-files-tab';
import {
    DeathAuditCaseFileTypes,
    DeathAuditFileTypes,
} from './death-audit-files/death-audit-files.types';
import DeathAuditQualification from './death-audit-qualification/detah-audit-qualification';
import DeathNotificationSidesheet from './death-notification';
import IndexAutomationCase from './index-automation-case/index-automation-case';
import ReceiveNewDocument from './receive-new-document/receive-new-document';
import {
    StepProgramTypes,
    TransactionsAdditionalDataStepIds,
} from './transactions-step-additional-data.types';
import { ViewTransactions } from './view-transactions';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

type TransactionalStepAdditionalDataProps = {
    stepAdditionalData: CaseAdditionalStepData;
    stepKey: TransactionsAdditionalDataStepIds;
};

export const stepsWithIndexAutomationCase = [
    TransactionsAdditionalDataStepIds.receiveRequest,
    TransactionsAdditionalDataStepIds.docIndentification,
    TransactionsAdditionalDataStepIds.docFieldExtraction,
    TransactionsAdditionalDataStepIds.docIndexedAndCaseCreated,
    TransactionsAdditionalDataStepIds.unableToIdentifyDocument,
];
export const TransactionsStepAdditionalData = ({
    stepAdditionalData,
    stepKey,
}: TransactionalStepAdditionalDataProps) => {
    const { featureFlags } = useOptimizely();
    const isIndexAutomationCaseEnabled = featureFlags[FEATURE_FLAGS.INDEX_AUTOMATION_CASE];
    const renderAdditionalData = (id: TransactionsAdditionalDataStepIds) => {
        switch (id) {
            case TransactionsAdditionalDataStepIds.stopSystematicPrograms:
                return (
                    <ViewTransactions
                        stepAdditionalData={stepAdditionalData}
                        prop={StepProgramTypes.SYSTEMATICPROGRAMS}
                    />
                );
            case TransactionsAdditionalDataStepIds.stopRMD:
                return (
                    <ViewTransactions
                        stepAdditionalData={stepAdditionalData}
                        prop={StepProgramTypes.RMDPROGRAMS}
                    />
                );
            case TransactionsAdditionalDataStepIds.stopSpecialPrograms:
                return (
                    <ViewTransactions
                        stepAdditionalData={stepAdditionalData}
                        prop={StepProgramTypes.SPECIALPROGRAMS}
                    />
                );
            case TransactionsAdditionalDataStepIds.receiveClaimRequest:
                return (
                    <DeathNotificationSidesheet
                        stepAdditionalData={stepAdditionalData}
                    />
                );
            case TransactionsAdditionalDataStepIds.stopUncashedTransactions:
                return (
                    <ViewTransactions
                        stepAdditionalData={stepAdditionalData}
                        prop={StepProgramTypes.UNCASHED}
                    />
                );
            case TransactionsAdditionalDataStepIds.claimsFundRelease:
                return (
                    <ClaimsFundRelease
                        stepAdditionalData={stepAdditionalData}
                    />
                );
            case TransactionsAdditionalDataStepIds.matchDocPerformMatch:
                return (
                    <DeathAuditQualification
                        stepAdditionalData={stepAdditionalData}
                    />
                );
            case TransactionsAdditionalDataStepIds.outboundDeathScrub:
                return (
                    <DeathAuditFiles
                        stepAdditionalData={stepAdditionalData}
                        prop={DeathAuditFileTypes.OUTBOUND}
                        title={'deathAuditFiles.details'}
                    />
                );
            case TransactionsAdditionalDataStepIds.inboundDeathScrub:
                return (
                    <DeathAuditFiles
                        stepAdditionalData={stepAdditionalData}
                        prop={DeathAuditFileTypes.INBOUND}
                        title={'deathAuditFiles.details'}
                        objectKey={DeathAuditCaseFileTypes.INBOUND_CASES_FILE}
                    />
                );
            case TransactionsAdditionalDataStepIds.performDAFileCaseMatch:
                return (
                    <DeathAuditFilesTab
                        stepAdditionalData={stepAdditionalData}
                    />
                );
            case TransactionsAdditionalDataStepIds.receiveNewDocument:
            case TransactionsAdditionalDataStepIds.receiveNewDocument2:
                return (
                    <ReceiveNewDocument
                        stepAdditionalData={stepAdditionalData}
                    />
                );
            case TransactionsAdditionalDataStepIds.complianceDbUpdate:
                return (
                    <ComplianceDbUpdate
                        stepAdditionalData={stepAdditionalData}
                    />
                );
            default:
                if (
                    isIndexAutomationCaseEnabled &&
                    stepsWithIndexAutomationCase.includes(id)
                ) {
                    return (
                        <IndexAutomationCase
                            stepAdditionalData={stepAdditionalData}
                            dataType={stepAdditionalData.dataType}
                        />
                    );
                }
                return null;
        }
    };

    return <>{stepKey && renderAdditionalData(stepKey)}</>;
};
