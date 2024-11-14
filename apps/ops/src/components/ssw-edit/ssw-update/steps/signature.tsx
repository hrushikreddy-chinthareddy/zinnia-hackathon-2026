import { useTranslation } from 'next-i18next';

import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';

import { signaturesConfig } from '../../bank-update/bank-update.helper';
import { sswEditFormValidator } from '../../ssw-edit-helper';
import { useContext } from 'react';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';

const Signature = () => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sswUpdate' });

    const { goToNext } = useWorkflow();

    const { formSignature, setFormErrors } = useContext(FormDataContext);

    const handleContinue = () => {
        const formErr = sswEditFormValidator(formSignature, t);
        if (Object.keys(formErr).length > 0) {
            setFormErrors(formErr);
            return;
        } else {
            goToNext();
        }
    };

    return (
        <WorkflowCard
            title={t('signTabTitle')}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-10"
                    disableContinue={false}
                    handleContinue={handleContinue}
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
