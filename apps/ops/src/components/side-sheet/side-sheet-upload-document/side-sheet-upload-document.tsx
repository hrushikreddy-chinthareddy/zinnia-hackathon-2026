import { Button } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import DocumentMetadataFilter from '@deps/components/dynamic-form/customization/components/document-metadata/metadata-filter';
import FileUpload from '@deps/components/file-upload/file-upload';
import { convertToBase64 } from '@deps/containers/people-data-cards/name-card/sidesheet/sidesheet-name-card.helpers';
import { getFileSubtype } from '@deps/helpers/document.helpers';
import { Case } from '@deps/models/case/case';
import { EDSDocumentRequestBody } from '@deps/models/case/document';
import { ActionTypes } from '@deps/models/case/task';
import { TaskDocument } from '@deps/models/case/task-instance';
import { uploadDocumentV2 } from '@deps/queries/api/documents';
import { EDS_DATE_DISPLAY_FORMAT } from '@deps/types/constants';
import { SourceSystem } from '@deps/types/documents-v3';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';
import { DocumentClassificationEnum } from '@zinnia/api-types/types/documents-v3';

import styles from './side-sheet-upload-document.module.css';

interface SideSheetUploadDocumentProps {
    caseDetails?: Case;
    setAttachments: (file: TaskDocument, operationType?: ActionTypes) => void;
    onClose: () => void;
}

const SideSheetUploadDocument = ({
    caseDetails,
    setAttachments,
    onClose,
}: SideSheetUploadDocumentProps) => {
    const { t } = useTranslation();
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [currentMetaData, setCurrentMetaData] =
        useState<EDSDocumentRequestBody>({} as EDSDocumentRequestBody);

    const setMetadataHandler = (data: EDSDocumentRequestBody) => {
        setCurrentMetaData(data);
    };

    const handleFilesChange = async (files: File[]) => {
        if (!files.length) {
            setUploadedFiles([]);
            return;
        }
        setUploadedFiles([files[0]]);
    };

    const onSubmit = async (data: EDSDocumentRequestBody, files: File[]) => {
        try {
            const failedUploads: string[] = [];
            const base64Results = await Promise.all(
                files.map((file) => convertToBase64(file))
            );
            await Promise.all(
                files.map(async (file, index) => {
                    const blob: Blob = file;
                    const metaData = {
                        ...data,
                        sourceFileName: file.name,
                        documentTypeDescription:
                            data.documentTypeDescription ?? file.name,
                        documentDate: dayjs().format(EDS_DATE_DISPLAY_FORMAT),
                        fileType: getFileSubtype(blob),
                        docClassification: DocumentClassificationEnum.INBOUND,
                        sourceSystem: SourceSystem.ZL,
                        zinniaLiveCaseId: caseDetails?.id ?? '',
                        parentCarrierCode: caseDetails?.carrier ?? '',
                        correlationId: caseDetails?.correlationId || '',
                    };
                    try {
                        const response = await uploadDocumentV2(
                            metaData,
                            base64Results[index]
                        );
                        if (response?.documentId) {
                            const attachment = {
                                documentId: response.documentId,
                                documentCategory: metaData?.docCategory,
                                documentType: metaData?.documentType,
                                documentExt: metaData?.fileType,
                                documentName:
                                    metaData?.documentTypeDescription ||
                                    file.name ||
                                    '',
                            };
                            setAttachments(attachment, ActionTypes.Add);
                        } else {
                            failedUploads.push(file.name); // Add the file name to the failed uploads list
                        }
                    } catch (error) {
                        browserLogError(
                            'FileWidget: Error uploading document:',
                            {
                                ...parseErrorInformation(error),
                            }
                        );
                        failedUploads.push(file.name); // Add the file name to the failed uploads list
                    }
                })
            );
        } catch (error) {
            setUploadError('Failed to upload file. Please try again.');
            browserLogError('Error uploading document:', {
                ...parseErrorInformation(error),
            });
        } finally {
            onClose();
        }
    };

    const onSubmitHandler = () => {
        onSubmit(currentMetaData, uploadedFiles);
    };

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <FileUpload
                    value={uploadedFiles}
                    onChange={handleFilesChange}
                    error={uploadError}
                    required={true}
                    singleFileUpload={true}
                />
                <DocumentMetadataFilter
                    carrier={caseDetails?.carrier as string}
                    currentMetaData={currentMetaData}
                    setCurrentMetaData={setMetadataHandler}
                    showRestricted={false}
                />
                <div className={styles.buttonRow}>
                    <Button
                        mode="secondary"
                        size="small"
                        type="button"
                        disabled={
                            !currentMetaData?.docCategory ||
                            !currentMetaData?.documentType ||
                            !uploadedFiles.length
                        }
                        onClick={onSubmitHandler}
                        className={styles.uploadBtn}
                    >
                        {t('allFields.upload')}
                    </Button>
                    <Button
                        mode="secondary"
                        size="small"
                        type="button"
                        onClick={() => onClose()}
                        className={styles.uploadBtn}
                    >
                        {t('allFields.cancel')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SideSheetUploadDocument;
