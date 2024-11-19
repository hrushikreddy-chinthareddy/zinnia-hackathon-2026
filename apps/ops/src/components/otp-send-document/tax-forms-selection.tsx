import 'react-pdf/dist/Page/TextLayer.css';
import { useTranslation } from 'next-i18next';

import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { Policy } from '@deps/models/policy/sor-policy';

import SendDocumentNavigationButtons from './action-components/navigation-buttons';
import WorkflowCard from '../workflows/workflow-card/workflow-card';

export type StatementSelectionProps = {
    policy: Policy;
};
const TaxFormsSelection = ({ policy }: StatementSelectionProps) => {
    console.log('🚀 ~ TaxFormsSelection ~ policy:', policy);
    const { t } = useTranslation(undefined, { keyPrefix: 'contactCenter' });
    const { goToNext } = useWorkflow();

    const handleContinue = async () => {
        goToNext();
    };

    const handleCancel = () => {};
    return (
        <WorkflowCard
            title={t(`sendTaxForms.tabs.taxFormsSelection`)}
            footerContent={<SendDocumentNavigationButtons handleContinue={handleContinue} handleCancel={handleCancel} />}
        ></WorkflowCard>
    );
};

export default TaxFormsSelection;
