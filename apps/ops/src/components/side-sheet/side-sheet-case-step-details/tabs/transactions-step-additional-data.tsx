import { CaseAdditionalStepData } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';

import DeathNotificationSidesheet from './death-notification';
import { TransactionsAdditionalDataStepIds } from './transactions-step-additional-data.types';
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
                        prop="systematicPrograms"
                    />
                );
            case TransactionsAdditionalDataStepIds.stopRMD:
                return (
                    <ViewTransactions
                        stepAdditionalData={stepAdditionalData}
                        prop="rmdPrograms"
                    />
                );
            case TransactionsAdditionalDataStepIds.stopSpecialPrograms:
                return (
                    <ViewTransactions
                        stepAdditionalData={stepAdditionalData}
                        prop="specialPrograms"
                    />
                );
            case TransactionsAdditionalDataStepIds.receiveClaimRequest:
                return (
                    <DeathNotificationSidesheet
                        stepAdditionalData={stepAdditionalData}
                    />
                );
            default:
                return null;
        }
    };

    return <>{stepKey && renderAdditionalData(stepKey)}</>;
};
