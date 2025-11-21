import React from 'react';
import { useTranslation } from 'react-i18next';

import Radio, {
    RadioOrientation,
    RadioVariant,
} from '@deps/components/radio/radio';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { BooleanValue } from '@deps/constants/policy';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { Policy } from '@zinnia/api-types/types/sor';

import { BooleanOptions } from '../../role-change-helper';

interface BeneDetailsStepProps {
    policy: Policy;
    role: string;
    leaveTransactionLink?: string;
}

const BeneDetailsStep = ({
    policy,
    role,
    leaveTransactionLink,
}: BeneDetailsStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'roleChange.beneDetails',
    });

    const { t: t2 } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'roleChange',
    });

    const { goToNext } = useWorkflow();

    const handleStepContinue = React.useCallback(() => {
        goToNext();
    }, []);

    const options = BooleanOptions(t2);

    return (
        <div>
            <WorkflowCard
                title={t('header')}
                footerContent={
                    <TransactionNavigationButtons
                        className="mt-10"
                        disableContinue={false}
                        handleContinue={handleStepContinue}
                        parentPage={ParentPage.CreateCase}
                        leaveTransactionLink={leaveTransactionLink}
                    />
                }
            >
                <Typography variant={TypographyVariant.H3} className="my-3">
                    {t('title')}
                </Typography>

                <Radio
                    items={options}
                    orientation={RadioOrientation.Horizontal}
                    onChange={() => null}
                    value={BooleanValue.No}
                    required={false}
                    disabled={true}
                    name={'bene.signature.selectOptions'}
                    variant={RadioVariant.Inactive}
                />
            </WorkflowCard>
        </div>
    );
};

export default BeneDetailsStep;
