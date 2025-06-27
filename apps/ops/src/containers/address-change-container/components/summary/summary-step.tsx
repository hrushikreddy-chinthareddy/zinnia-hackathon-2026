import { Policy } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';

import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';

import { ContactDetailsSummary } from './contact-details-summary';
import { ApplicableRolesContractSummary } from './roles-contract-summary';
import { SignatureSummary } from './signature-summary';
import { useAddressChange } from '../../address-change-provider';

type AddressChangeSummaryStep = {
    policy: Policy;
    isSignatureSummaryRequired: boolean;
};

export const SummaryStep = ({
    policy,
    isSignatureSummaryRequired,
}: AddressChangeSummaryStep) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'addressChange',
    });
    const { signatureData, submitSuccess } = useAddressChange();
    const dataRows = signatureData?.signatures ?? [];

    const { goToNext } = useWorkflow();

    const handleStepContinue = () => {
        goToNext();
    };

    return (
        <WorkflowCard
            title={t('summary.title')}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    handleContinue={handleStepContinue}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink="/create-case"
                    disableContinue={submitSuccess}
                />
            }
        >
            <>
                <Typography className="mb-10" variant={TypographyVariant.Body}>
                    {t('summary.subTitle')}
                </Typography>

                <div className="w-3/5">
                    <ContactDetailsSummary policy={policy} />
                </div>

                <ApplicableRolesContractSummary
                    policy={policy}
                ></ApplicableRolesContractSummary>
                {isSignatureSummaryRequired && dataRows.length ? (
                    <SignatureSummary dataRows={dataRows} />
                ) : null}
            </>
        </WorkflowCard>
    );
};
