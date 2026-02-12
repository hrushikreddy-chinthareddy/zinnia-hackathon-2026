import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from '@zinnia/bloom/components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import FileListing from '@deps/components/dynamic-form/customization/components/file-listing/file-listing';
import { FileSearchField } from '@deps/components/dynamic-form/customization/components/file-search-field/file-search-field';
import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import SuccessErrorSideSheet from '@deps/containers/case-sub-page/success-error-side-sheet';
/**
 * @deprecated Use standard Sidesheet from Bloom component library
 */
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { Case, CorrectionReason, CorrectionType } from '@deps/models/case/case';
import {
    DefaultDataEntryTask,
    RequestType,
} from '@deps/models/case/default-case';
import { ActionTypes } from '@deps/models/case/task';
import { TaskDocument } from '@deps/models/case/task-instance';
import { submitServiceRequestForm } from '@deps/queries/api/process';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import styles from './side-sheet-request-correction.module.css';
import SideSheet from '../side-sheet';
import SideSheetUploadDocument from '../side-sheet-upload-document/side-sheet-upload-document';

interface SideSheetRequestCorrectionProps {
    caseDetails?: Case;
    onClose: () => void;
}

const SideSheetRequestCorrection = ({
    caseDetails,
    onClose,
}: SideSheetRequestCorrectionProps) => {
    const { t } = useTranslation();
    const { user } = useUser();
    const sideSheet = useSideSheetContextLegacy();
    const correctionTypeOptions = [
        {
            label: t('enums.death'),
            value: CorrectionType.Death,
        },
        {
            label: t('enums.financial'),
            value: CorrectionType.Financial,
        },
        {
            label: t('enums.licensing'),
            value: CorrectionType.Licensing,
        },
        {
            label: t('enums.maturity'),
            value: CorrectionType.Maturity,
        },
        {
            label: t('enums.nonFinancial'),
            value: CorrectionType.NonFinancial,
        },
        {
            label: t('enums.tax'),
            value: CorrectionType.Tax,
        },
    ];

    const correctionReasonOptions = [
        {
            label: t('enums.complianceRequirementChange'),
            value: CorrectionReason.ComplianceRequirementChange,
        },
        {
            label: t('enums.customerCorrectionRequest'),
            value: CorrectionReason.CustomerCorrectionRequest,
        },
        {
            label: t('enums.dataEntryError'),
            value: CorrectionReason.DataEntryError,
        },
        {
            label: t('enums.deathEventDetailsIncorrect'),
            value: CorrectionReason.DeathEventDetailsIncorrect,
        },
        {
            label: t('enums.documentationMissingOrInvalid'),
            value: CorrectionReason.DocumentationMissingOrInvalid,
        },
        {
            label: t('enums.maturityEventIncorrect'),
            value: CorrectionReason.MaturityEventIncorrect,
        },
        {
            label: t('enums.onboardingDataIncorrect'),
            value: CorrectionReason.OnboardingDataIncorrect,
        },
        {
            label: t('enums.submittedVsProcessedMismatch'),
            value: CorrectionReason.SubmittedVsProcessedMismatch,
        },
        {
            label: t('enums.systemError'),
            value: CorrectionReason.SystemError,
        },
    ];

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [correctionType, setCorrectionType] = useState('');
    const [correctionReason, setCorrectionReason] = useState('');
    const [notes, setNotes] = useState('');

    const [attachments, setAttachments] = useState<TaskDocument[]>([]);
    const handleSetAttachments = (
        currentAttachment: TaskDocument,
        operationType?: ActionTypes
    ) => {
        if (!currentAttachment || !currentAttachment.documentId) {
            browserLogError(
                'useAttachments: Invalid attachment:',
                currentAttachment
            );
            return;
        }

        let updatedAttachments: TaskDocument[];

        if (operationType === ActionTypes.Remove) {
            updatedAttachments = attachments.filter(
                (item) => item.documentId !== currentAttachment.documentId
            );
        } else {
            updatedAttachments = [currentAttachment];
        }

        setAttachments(updatedAttachments);
    };

    const openUploadDocumentSideSheet = () => {
        setIsUploadOpen(true);
    };

    const onSubmitHandler = async () => {
        const payload: DefaultDataEntryTask = {
            caseDetails: {
                caseType: 'Correction Request',
                caseSubType: correctionType,
                contractNumber:
                    caseDetails?.additionalData?.contractNumber ??
                    caseDetails?.policyNumber ??
                    '',
                carrier: caseDetails?.carrier ?? '',
            },
            attachments: attachments,
            correctionDetails: {
                reason: correctionReason,
                referenceCaseId: caseDetails?.id ?? '',
                requestedBy: user?.email ?? '',
                requestedOn: new Date().toISOString(),
                note: notes,
            },
        };
        try {
            const response = await submitServiceRequestForm(
                payload,
                RequestType.Case_Service_Request
            );
            if (response) {
                const content = (
                    <SuccessErrorSideSheet
                        response={response}
                        sideSheet={sideSheet}
                        successMessage={t(
                            `allFields.requestCorrectionSuccess`,
                            {}
                        )}
                        errorMessage={t(`allFields.requestCorrrectionFail`)}
                    />
                );
                sideSheet.changeSideSheetContent(
                    t('quickActions.cases.requestCorrection'),
                    content
                );
                sideSheet.handleOpen(true);
            }
        } catch (error) {
            browserLogError('Error submitting correction request:', {
                ...parseErrorInformation(error),
            });
        }
    };

    return (
        <>
            <div className={styles.container}>
                <div className={styles.section}>
                    <Typography variant={TypographyVariant.H2}>
                        {t('allFields.details')}
                    </Typography>
                    <Typography variant={TypographyVariant.BodySm}>
                        {t('allFields.overviewText')}
                    </Typography>
                    <Select
                        label={t('allFields.correctionType') ?? ''}
                        required={true}
                        onChange={(val) => {
                            setCorrectionType(val);
                        }}
                        options={correctionTypeOptions}
                        placeholder={t('allFields.selectCorrectionType') ?? ''}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={correctionType}
                    />
                    <Select
                        label={t('allFields.correctionReason') ?? ''}
                        onChange={(val) => {
                            setCorrectionReason(val);
                        }}
                        required={true}
                        options={correctionReasonOptions}
                        placeholder={
                            t('allFields.selectCorrectionReason') ?? ''
                        }
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={correctionReason}
                    />
                    <Field
                        label={t('allFields.additionalNotes') ?? ''}
                        placeholder={t('allFields.addNotes') ?? ''}
                        variant={FieldVariant.Default}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                    <div>
                        <div className="flex items-center gap-1">
                            <Typography variant={TypographyVariant.BodySmBold}>
                                {t('allFields.linkOrUploadDocument')}
                            </Typography>
                            <span className="text-semantic-error">&nbsp;*</span>
                        </div>
                        <div className={styles.uploadRow}>
                            <FileSearchField
                                attachments={attachments}
                                setAttachments={handleSetAttachments}
                            />
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className="mt-2"
                            >
                                {t('allFields.or')}
                            </Typography>
                            <Button
                                mode="secondary"
                                size="small"
                                type="button"
                                disabled={false}
                                className={styles.uploadBtn}
                                onClick={openUploadDocumentSideSheet}
                            >
                                {t('allFields.upload')}
                            </Button>
                            {isUploadOpen && (
                                <SideSheet
                                    header={t('allFields.uploadDocument') ?? ''}
                                    handleClose={() => setIsUploadOpen(false)}
                                    open={true}
                                >
                                    <SideSheetUploadDocument
                                        caseDetails={caseDetails}
                                        setAttachments={handleSetAttachments}
                                        onClose={() => setIsUploadOpen(false)}
                                    />
                                </SideSheet>
                            )}
                        </div>
                    </div>

                    {attachments?.length ? (
                        <div>
                            <FileListing
                                attachments={attachments}
                                setAttachments={handleSetAttachments}
                            />
                        </div>
                    ) : null}

                    <div className={styles.actions}>
                        <Button
                            mode="secondary"
                            size="small"
                            type="button"
                            disabled={
                                !correctionType ||
                                !correctionReason ||
                                !attachments?.length
                            }
                            className={styles.uploadBtn}
                            onClick={onSubmitHandler}
                        >
                            {t('allFields.submit')}
                        </Button>
                        <Button
                            mode="secondary"
                            size="small"
                            type="button"
                            className={styles.uploadBtn}
                            onClick={() => onClose()}
                        >
                            {t('allFields.cancel')}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SideSheetRequestCorrection;
