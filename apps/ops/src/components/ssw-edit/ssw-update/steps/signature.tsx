import { useTranslation } from 'next-i18next';

import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';

import { signaturesConfig } from '../../bank-update/bank-update.helper';

const Signature = () => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sswUpdate.tabs.signature' });

    const { goToNext } = useWorkflow();

    return (
        <WorkflowCard
            title={t('tabTitle')}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-10"
                    disableContinue={false}
                    handleContinue={() => goToNext()}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink="/create-case"
                />
            }
        >
            <div className="mx-[-30px]">
                <SignatureValidations isFormStateReadOnly={false} config={signaturesConfig} />
            </div>
        </WorkflowCard>
    );
};

export default Signature;
