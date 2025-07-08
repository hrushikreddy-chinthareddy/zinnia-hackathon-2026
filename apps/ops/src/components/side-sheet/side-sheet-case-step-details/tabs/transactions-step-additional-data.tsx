import { CaseAdditionalStepData } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';

import DeathNotificationSidesheet from './death-notification';
import {
  StepProgramTypes,
  TransactionsAdditionalDataStepIds,
} from './transactions-step-additional-data.types';
import { ViewTransactions } from './view-transactions';

type TransactionalStepAdditionalDataProps = {
  stepAdditionalData: CaseAdditionalStepData;
  stepKey: TransactionsAdditionalDataStepIds;
};

export const TransactionsStepAdditionalData = ({
  stepAdditionalData,
  stepKey,
}: TransactionalStepAdditionalDataProps) => {
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
            default:
                return null;
        }
    };

  return <>{stepKey && renderAdditionalData(stepKey)}</>;
};
