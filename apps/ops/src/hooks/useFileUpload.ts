import { dataURItoBlob } from '@rjsf/utils';
import { ToastVariant } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { UploadContextData } from '@deps/components/dynamic-form/customization/widgets/file-widget/file-widget';
import { TranslationFiles } from '@deps/config/translations';
import { getFileSubtype } from '@deps/helpers/document.helpers';
import { EDSDocumentRequestBody } from '@deps/models/case/document';
import { ActionTypes } from '@deps/models/case/task';
import { TaskDocument } from '@deps/models/case/task-instance';
import { uploadDocumentV2 } from '@deps/queries/api/documents';
import { EDS_DATE_DISPLAY_FORMAT } from '@deps/types/constants';
import { SourceSystem } from '@deps/types/documents-v3';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';
import { DocumentClassificationEnum } from '@zinnia/api-types/types/documents-v3';

const INTERVAL = 3000;

interface UseFileUploadParams {
    formContext?: any;
    contextData?: UploadContextData;
    setAttachments: (file: TaskDocument, operationType?: ActionTypes) => void;
    onUploadComplete?: (docs: TaskDocument[]) => void;
}

export function useFileUpload({
    formContext,
    contextData,
    setAttachments,
    onUploadComplete,
}: UseFileUploadParams) {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'general.fileUploadToastMessages',
    });
    const [toastMessage, setToastMessage] = useState<string | undefined>();
    const [toastVariant, setToastVariant] = useState<
        ToastVariant | undefined
    >();
    const [loading, setLoading] = useState(false);

    const onSubmit = useCallback(
        async (
            data: EDSDocumentRequestBody,
            files: string[],
            handleClose: () => void
        ) => {
            setLoading(true);
            const failedUploads: string[] = [];
            const uploadedDocs: TaskDocument[] = [];

            try {
                const uploadPromises = files.map(async (fileData) => {
                    const { blob, name } = dataURItoBlob(fileData);
                    const metaData = {
                        ...data,
                        sourceFileName: name,
                        documentDate: dayjs().format(EDS_DATE_DISPLAY_FORMAT),
                        fileType: getFileSubtype(blob),
                        docClassification: DocumentClassificationEnum.INBOUND,
                        sourceSystem: SourceSystem.ZL,
                        zinniaLiveCaseId:
                            formContext?.customData?.caseId ??
                            contextData?.caseId ??
                            '',
                        parentCarrierCode:
                            formContext?.customData?.carrier ??
                            contextData?.carrier ??
                            '',
                        correlationId:
                            formContext?.correlationId ??
                            contextData?.correlationId ??
                            '',
                    };

                    browserLogInfo('FileWidget: Uploading document', {
                        ...metaData,
                        fileName: name,
                    });

                    try {
                        const response = await uploadDocumentV2(
                            metaData,
                            fileData
                        );
                        if (response?.documentId) {
                            const doc = {
                                documentId: response.documentId,
                                documentCategory: metaData?.docCategory,
                                documentType: metaData?.documentType,
                                documentExt: metaData?.fileType,
                                documentName:
                                    metaData?.documentTypeDescription ||
                                    name ||
                                    '',
                            };
                            setAttachments(doc, ActionTypes.Add);
                            uploadedDocs.push(doc);
                        } else {
                            failedUploads.push(name);
                        }
                    } catch (error) {
                        browserLogError(
                            'FileWidget: Error uploading document',
                            {
                                ...parseErrorInformation(error),
                                fileName: name,
                            }
                        );
                        failedUploads.push(name);
                    }
                });

                await Promise.allSettled(uploadPromises);

                if (failedUploads.length > 0) {
                    setToastVariant(ToastVariant.Error);
                    setToastMessage(
                        t('fileUploadError', {
                            failedUploads: failedUploads.join(', '),
                        }) as string
                    );
                } else {
                    setToastVariant(ToastVariant.Success);
                    setToastMessage(t('fileUploadSuccess', {}) as string);
                    if (onUploadComplete && uploadedDocs.length) {
                        onUploadComplete(uploadedDocs);
                    }
                    handleClose?.();
                }
            } finally {
                setLoading(false);
            }
        },
        [formContext, contextData, setAttachments, onUploadComplete, t]
    );

    useEffect(() => {
        if (toastMessage && toastVariant) {
            const timer = setTimeout(() => {
                setToastMessage(undefined);
                setToastVariant(undefined);
            }, INTERVAL);
            return () => clearTimeout(timer);
        }
    }, [toastMessage, toastVariant]);

    return {
        onSubmit,
        toastMessage,
        toastVariant,
        loading,
    };
}
