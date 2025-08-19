import { Policy } from '@xd/api-types/dist/generated-types/sor';
import {
    AssistiveText,
    AssistiveTextVariant,
    Label,
    Loader,
    Select,
    SelectProps,
} from '@zinnia/bloom/components';
import router from 'next/router';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { ContactCenterTransactionType } from '@deps/types/segment-analytics';

import CorrespondenceError from './error';
import styles from './styles.module.css';
import SendDocumentNavigationButtons from '../otp-send-document/action-components/navigation-buttons';
import Typography, { TypographyVariant } from '../typography/typography';
import WorkflowCard from '../workflows/workflow-card/workflow-card';

export type CorrespondenceSelectionProps = {
    policy: Policy;
    onSelection: (letterType: string) => void;
    letterOptions: SelectProps['options'];
    submitRequest: () => void;
    isLoading: boolean;
};

const CorrespondenceSelection = ({
    policy,
    onSelection,
    letterOptions,
    submitRequest,
    isLoading,
}: CorrespondenceSelectionProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const { goToNext } = useWorkflow();

    const [selectedLetterType, setSelectedLetterType] = useState('');
    const [hasError, setError] = useState(false);

    const handleContinue = async () => {
        if (!selectedLetterType) {
            return setError(true);
        }
        submitRequest();
        goToNext();
    };

    const handleCancel = () => {
        router.push(
            `/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/policy-details`
        );
    };

    const handleChange = (val: string) => {
        setSelectedLetterType(val);
        onSelection(val);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center mt-12">
                <Loader />
            </div>
        );
    }

    // There's no error state designed but there needs to be something here if the letter call fails
    if (!letterOptions.length) {
        return <CorrespondenceError policy={policy} />;
    }

    return (
        <WorkflowCard
            title={t(
                `contactCenter.sendCorrespondence.tabs.sendCorrespondence`
            )}
            footerContent={
                <SendDocumentNavigationButtons
                    handleContinue={handleContinue}
                    handleCancel={handleCancel}
                    trackEventProps={{
                        type: ContactCenterTransactionType.CORRESPONDENCE,
                    }}
                />
            }
        >
            <div className={styles.subContainer}>
                <Typography variant={TypographyVariant.BodyBold}>
                    {t('contactCenter.sendCorrespondence.subtitle')}
                </Typography>
                <Typography variant={TypographyVariant.Body}>
                    {t('contactCenter.sendCorrespondence.body')}
                </Typography>
            </div>
            <Typography
                variant={TypographyVariant.H3}
                className={styles.subHeading}
            >
                {t('contactCenter.sendCorrespondence.subtitle2')}
            </Typography>
            <Select
                options={letterOptions}
                fieldSize="small"
                id="field-select"
                label={
                    <Label labelFor="field-select">
                        {t('contactCenter.sendCorrespondence.label')}
                    </Label>
                }
                placeholder={
                    t(
                        'contactCenter.sendCorrespondence.letterTypes.selectOne'
                    ) || undefined
                }
                onValueChange={handleChange}
                triggerClassName={styles.dropdown}
            ></Select>
            {hasError && (
                <div className="flex flex-col mt-2">
                    <AssistiveText
                        text={t('contactCenter.sendCorrespondence.error')}
                        variant={AssistiveTextVariant.Error}
                    />
                </div>
            )}
        </WorkflowCard>
    );
};

export default CorrespondenceSelection;
