import { Icon, IconType } from '@zinnia/bloom/components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import Field, { FieldSize, FieldType } from '@deps/components/fields/field';
import FieldLabel from '@deps/components/fields/field-label';
import { validateEmail } from '@deps/components/otp-send-document/correspondence';
import Radio from '@deps/components/radio/radio';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import {
    DislikeReasonsPayload,
    OpsIntakeFormPayload,
} from '@deps/types/knowledge-base';

import styles from './ops-intake-form.module.css';

const TextField = ({
    label,
    value,
    onChange,
    required = true,
    message = '',
    ...props
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    message?: string;
}) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant.chat.feedback',
    });

    return (
        <Field
            label={t(label) || ''}
            placeholder={t('opsIntakeForm.placeholder') || ''}
            size={FieldSize.Default}
            type={FieldType.BaseActive}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            message={message}
            {...props}
        />
    );
};

type OpsIntakeFormProps = {
    metadata: OpsIntakeFormPayload;
    setOpenOpsIntakeForm: (open: boolean) => void;
    dislikeReason: DislikeReasonsPayload;
    setMetadata: (metadata: OpsIntakeFormPayload) => void;
    onDislikeReasonChange: (payload: DislikeReasonsPayload) => void;
};

enum Priority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Critical = 'Critical',
}

enum RequestFrequency {
    Daily = 'Daily',
    Weekly = 'Weekly',
    Monthly = 'Monthly',
    Annually = 'Annually',
}

const OpsIntakeForm = ({
    metadata,
    setOpenOpsIntakeForm,
    dislikeReason,
    setMetadata,
    onDislikeReasonChange,
}: OpsIntakeFormProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant.chat.feedback',
    });
    const [processName, setProcessName] = useState(metadata.processName || '');
    const [blockOfBusiness, setBlockOfBusiness] = useState(
        metadata.blockOfBusiness || ''
    );
    const [processDescription, setProcessDescription] = useState(
        metadata.processDescription || ''
    );
    const [outcomeExpected, setOutcomeExpected] = useState(
        metadata.outcomeExpected || ''
    );
    const [smeEmail, setSmeEmail] = useState(metadata.smeEmail || '');
    const [priority, setPriority] = useState<Priority>(
        (metadata.priority as Priority) || Priority.Low
    );
    const [requestFrequency, setRequestFrequency] = useState<RequestFrequency>(
        (metadata.requestFrequency as RequestFrequency) ||
            RequestFrequency.Daily
    );
    const [benefitMetrics, setBenefitMetrics] = useState(
        metadata.benefitMetrics || ''
    );

    const validateOpsIntakeForm = () => {
        return Boolean(
            processName.trim() &&
                blockOfBusiness.trim() &&
                processDescription.trim() &&
                outcomeExpected.trim() &&
                smeEmail.trim() &&
                !validateEmail(smeEmail) &&
                priority &&
                requestFrequency.trim() &&
                benefitMetrics.trim()
        );
    };

    const handleOnClose = () => {
        setMetadata({} as OpsIntakeFormPayload);
        setOpenOpsIntakeForm(false);
    };

    const handleOnSubmit = () => {
        const isFormValidated = validateOpsIntakeForm();
        if (isFormValidated) {
            const newMetadata = {
                processName,
                blockOfBusiness,
                processDescription,
                outcomeExpected,
                smeEmail,
                priority,
                requestFrequency,
                benefitMetrics,
            };
            setMetadata(newMetadata);
            const newDislikeReasonPayload = {
                ...dislikeReason,
                metadata: newMetadata,
            };
            onDislikeReasonChange(newDislikeReasonPayload);
            setOpenOpsIntakeForm(false);
        }
    };

    const priorityRadioOptions = Object.values(Priority).map((p) => ({
        label: p,
        ariaLabel: p,
        value: p,
    }));

    const requestFrequencyRadioOptions = Object.values(RequestFrequency).map(
        (p) => ({
            label: p,
            ariaLabel: p,
            value: p,
        })
    );

    return (
        <div className="h-full overflow-y-auto my-4 mx-4">
            <Typography variant={TypographyVariant.H2} className="mb-4">
                {t('opsIntakeForm.heading')}
            </Typography>

            <div className="flex flex-col gap-6">
                <TextField
                    label={'opsIntakeForm.processName'}
                    value={processName}
                    onChange={setProcessName}
                />

                <div className="flex flex-col gap-2">
                    <TextField
                        label={'opsIntakeForm.blockOfBusiness'}
                        value={blockOfBusiness}
                        onChange={setBlockOfBusiness}
                    />
                    <AssistiveText
                        text={
                            t('opsIntakeForm.blockOfBusinessAssistiveText') ||
                            ''
                        }
                        variant={AssistiveTextVariant.Brand}
                        iconOverride={<Icon type={IconType.CIRCLE_INFO} />}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <FieldLabel
                        label={t('opsIntakeForm.processDescription') || ''}
                        required
                    />
                    <textarea
                        aria-label="opsIntakeForm.processDescription"
                        placeholder={t('opsIntakeForm.placeholder') || ''}
                        value={processDescription}
                        onChange={(e) => setProcessDescription(e.target.value)}
                        className={`w-full !outline-none !ring-0 ${styles.textboxContainer}`}
                        required
                    />
                </div>

                <TextField
                    label={'opsIntakeForm.outcomeExpected'}
                    value={outcomeExpected}
                    onChange={setOutcomeExpected}
                />
                <TextField
                    label={'opsIntakeForm.smeEmail'}
                    value={smeEmail}
                    onChange={setSmeEmail}
                    message={
                        (smeEmail &&
                            validateEmail(smeEmail) &&
                            t(validateEmail(smeEmail) as string)) ??
                        ''
                    }
                />

                <Radio
                    label={t('opsIntakeForm.priority') || ''}
                    value={priority}
                    items={priorityRadioOptions}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPriority(e.target.value as Priority)
                    }
                    required
                />

                <div className="flex flex-col gap-2">
                    <Radio
                        label={t('opsIntakeForm.requestFrequency') || ''}
                        value={requestFrequency}
                        items={requestFrequencyRadioOptions}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setRequestFrequency(
                                e.target.value as RequestFrequency
                            )
                        }
                        required
                    />
                    <AssistiveText
                        text={
                            t('opsIntakeForm.requestFrequencyAssistiveText') ||
                            ''
                        }
                        variant={AssistiveTextVariant.Brand}
                        iconOverride={<Icon type={IconType.CIRCLE_INFO} />}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <TextField
                        label={'opsIntakeForm.benefitMetrics'}
                        value={benefitMetrics}
                        onChange={setBenefitMetrics}
                    />
                    <AssistiveText
                        text={
                            t('opsIntakeForm.benefitMetricsAssistiveText') || ''
                        }
                        variant={AssistiveTextVariant.Brand}
                        iconOverride={<Icon type={IconType.CIRCLE_INFO} />}
                    />
                </div>
            </div>

            <div className="flex gap-2 justify-end my-4">
                <Button
                    aria-label="cancel-ops-form"
                    type={ButtonType.Secondary}
                    size={ButtonSize.Small}
                    onClick={handleOnClose}
                >
                    {t('cancel')}
                </Button>
                <Button
                    aria-label="submit-ops-form"
                    type={ButtonType.Primary}
                    size={ButtonSize.Small}
                    onClick={handleOnSubmit}
                    disabled={!validateOpsIntakeForm()}
                >
                    {t('submit')}
                </Button>
            </div>
        </div>
    );
};

export default OpsIntakeForm;
