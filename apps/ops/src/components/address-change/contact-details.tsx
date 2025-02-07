// TODO MG: this isnt used
import { useTranslation } from 'next-i18next';
import React, { useCallback } from 'react';

import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { Policy } from '@deps/models/policy/sor-policy';

import CheckboxText from '../checkbox/checkbox-text/checkbox-text';

interface ContactDetailsProps {
    policy: Policy;
}

const ContactDetails = ({ policy }: ContactDetailsProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'addressChange.contactDetails' });
    const { goToNext } = useWorkflow();

    const handleContinue = useCallback(() => {
        goToNext();
    }, [goToNext]);

    return (
        <WorkflowCard
            title={t('label')}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    handleContinue={handleContinue}
                    parentPage={ParentPage.Withdrawals}
                    planCode={policy.product?.planCode}
                    policyNumber={policy.policyNumber}
                />
            }
        >
            <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-4">
                    <Typography variant={TypographyVariant.LabelLg}>{t('title')}</Typography>
                    <div className="flex flex-col">
                        <CheckboxText
                            checked={false}
                            label={t('fieldLabels.address')}
                            onChange={() => {}}
                        />
                         <CheckboxText
                            checked={false}
                            label={t('fieldLabels.phone')}
                            onChange={() => {}}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                   FORM TO BE UPDATED
                </div>

            </div>


        </WorkflowCard>
    );
};

export default ContactDetails;
