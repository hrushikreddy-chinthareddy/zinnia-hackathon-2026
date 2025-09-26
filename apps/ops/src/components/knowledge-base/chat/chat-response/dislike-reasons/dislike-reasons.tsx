import { Button, Icon, IconType } from '@zinnia/bloom/components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ButtonSize } from '@deps/components/button/button';
import Field, { FieldSize, FieldType } from '@deps/components/fields/field';
import { Modal } from '@deps/components/modal/modal';
import Radio from '@deps/components/radio/radio';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import {
    DislikeReasonsPayload,
    OpsIntakeFormPayload,
} from '@deps/types/knowledge-base';

import OpsIntakeForm from '../ops-intake-form/ops-intake-form';

type DislikeReasonsProps = {
    dislikeReason: DislikeReasonsPayload;
    onDislikeReasonChange: (payload: DislikeReasonsPayload) => void;
};

const DislikeReasons = ({
    dislikeReason,
    onDislikeReasonChange,
}: DislikeReasonsProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant',
    });
    const dislikeReasonOptions = {
        incorrectResponse: t('chat.feedback.dislikeReasons.incorrectResponse'),
        languageIssue: t('chat.feedback.dislikeReasons.languageIssue'),
        relevantDocumentMissing: t(
            'chat.feedback.dislikeReasons.relevantDocumentMissing'
        ),
        infoMissing: t('chat.feedback.dislikeReasons.infoMissing'),
    };
    const [reason, setReason] = useState<string>('');
    const [linksString, setLinksString] = useState<string>('');
    const [openOpsIntakeForm, setOpenOpsIntakeForm] = useState<boolean>(false);
    const [metadata, setMetadata] = useState<OpsIntakeFormPayload>(
        {} as OpsIntakeFormPayload
    );

    const documentLinks = linksString && linksString.split(',');

    const handleChangeRadio = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLinksString('');
        const newReason = e.target.value;
        setReason(newReason);

        const newDislikeReasonPayload = {
            reason: newReason,
            ...(newReason ===
            (dislikeReasonOptions.incorrectResponse ||
                dislikeReasonOptions.relevantDocumentMissing)
                ? { links: documentLinks }
                : { links: null }),
            ...(newReason === dislikeReasonOptions.infoMissing
                ? { metadata }
                : { metadata: null }),
        };
        onDislikeReasonChange(newDislikeReasonPayload as DislikeReasonsPayload);
    };

    const handleAddLinks = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newLinks = e.target.value;
        setLinksString(newLinks);
        const newDislikeReasonPayload = {
            reason,
            links: newLinks.split(','),
            metadata: null,
        };
        onDislikeReasonChange(newDislikeReasonPayload);
    };

    const radioOptions = [
        {
            label: t('chat.feedback.dislikeReasons.incorrectResponse'),
            value: t('chat.feedback.dislikeReasons.incorrectResponse'),
            disabled: false,
            subElement: (
                <div className="flex flex-col gap-2">
                    <Typography variant={TypographyVariant.BodyParagraph}>
                        {t('chat.feedback.dislikeReasons.incorrectResponse')}
                    </Typography>
                    {reason === dislikeReasonOptions.incorrectResponse && (
                        <Field
                            label={
                                t('chat.feedback.dislikeReasons.linksLabel') ||
                                ''
                            }
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={linksString}
                            onChange={handleAddLinks}
                        />
                    )}
                </div>
            ),
        },
        {
            label: t('chat.feedback.dislikeReasons.languageIssue'),
            value: t('chat.feedback.dislikeReasons.languageIssue'),
            disabled: false,
            subElement: (
                <div>
                    <Typography variant={TypographyVariant.BodyParagraph}>
                        {t('chat.feedback.dislikeReasons.languageIssue')}
                    </Typography>
                </div>
            ),
        },
        {
            label: t('chat.feedback.dislikeReasons.relevantDocumentMissing'),
            value: t('chat.feedback.dislikeReasons.relevantDocumentMissing'),
            disabled: false,
            subElement: (
                <div className="flex flex-col gap-2">
                    <Typography variant={TypographyVariant.BodyParagraph}>
                        {t(
                            'chat.feedback.dislikeReasons.relevantDocumentMissing'
                        )}
                    </Typography>
                    {reason ===
                        dislikeReasonOptions.relevantDocumentMissing && (
                        <Field
                            label={
                                t('chat.feedback.dislikeReasons.linksLabel') ||
                                ''
                            }
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={linksString}
                            onChange={handleAddLinks}
                        />
                    )}
                </div>
            ),
        },
        {
            label: t('chat.feedback.dislikeReasons.infoMissing'),
            value: t('chat.feedback.dislikeReasons.infoMissing'),
            disabled: false,
            subElement: (
                <div className="flex flex-col gap-2 items-start">
                    <Typography variant={TypographyVariant.BodyParagraph}>
                        {t('chat.feedback.dislikeReasons.infoMissing')}
                    </Typography>
                    {reason === dislikeReasonOptions.infoMissing && (
                        <Button
                            aria-label="ops-intake-form-btn"
                            mode="link"
                            size={ButtonSize.Small}
                            onClick={() => setOpenOpsIntakeForm(true)}
                        >
                            {Object.keys(metadata).length > 0 && (
                                <Icon
                                    type={IconType.CIRCLE_CHECKMARK}
                                    className="mr-1"
                                />
                            )}
                            {t('chat.feedback.opsIntakeFormLink')}
                            <span className="text-red-700 ml-1">*</span>
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="mt-2">
            <Typography variant={TypographyVariant.BodySmBold} className="mb-2">
                {t('chat.feedback.dislikeReasonsHeader')}
                <span className="text-red-700">*</span>
            </Typography>
            <Radio
                items={radioOptions}
                value={reason}
                disabled={false}
                onChange={handleChangeRadio}
                className="text-sm"
                alignItems="items-stretch"
            />
            <Modal
                open={openOpsIntakeForm}
                onCancel={() => setOpenOpsIntakeForm(false)}
                closeIcon="X"
                bigSize
                content={
                    <OpsIntakeForm
                        metadata={metadata}
                        setOpenOpsIntakeForm={setOpenOpsIntakeForm}
                        setMetadata={setMetadata}
                        dislikeReason={dislikeReason}
                        onDislikeReasonChange={onDislikeReasonChange}
                    />
                }
            />
        </div>
    );
};

export default DislikeReasons;
