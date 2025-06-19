import {
    dataURItoBlob,
    FormContextType,
    getTemplate,
    getUiOptions,
    Registry,
    RJSFSchema,
    StrictRJSFSchema,
    UIOptionsType,
    WidgetProps,
} from '@rjsf/utils';
import { SearchRequest } from '@zinnia/api-types/types/documents-v3';
import { Toast, ToastVariant } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { EDSDocumentRequestBody } from '@deps/models/case/document';
import { uploadDocumentV2 } from '@deps/queries/api/documents';
import { ReactComponent as UploadIcon } from '@deps/styles/elements/icons/files/upload.svg';
import { EDS_DATE_DISPLAY_FORMAT } from '@deps/types/constants';
import { SourceSystem } from '@deps/types/documents-v3';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';
import { attachFilesToMappedDocuments } from '@deps/utils/tasks/task-payload-helpers';

import FileAttachmentComponent from './file-attachment.component';
import style from './file-widget.module.css';

const INTERVAL = 3000;

function addNameToDataURL(dataURL: string, name: string) {
    if (dataURL === null) {
        return null;
    }
    return dataURL.replace(';base64', `;name=${encodeURIComponent(name)};base64`);
}

type FileInfoType = {
    dataURL?: string | null;
    name: string;
    size: number;
    type: string;
};

function processFile(file: File): Promise<FileInfoType> {
    const { name, size, type } = file;
    return new Promise((resolve, reject) => {
        const reader = new window.FileReader();
        reader.onerror = reject;
        reader.onload = event => {
            if (typeof event.target?.result === 'string') {
                resolve({
                    dataURL: addNameToDataURL(event.target.result, name),
                    name,
                    size,
                    type,
                });
            } else {
                resolve({
                    dataURL: null,
                    name,
                    size,
                    type,
                });
            }
        };
        reader.readAsDataURL(file);
    });
}

function processFiles(files: FileList) {
    return Promise.all(Array.from(files).map(processFile));
}

function getFileSubtype(blob: Blob) {
    if (blob && blob.type && blob.type.includes('/')) {
        return blob.type.split('/')[1];
    }
    return blob.type || '';
}

export function FilesInfo<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
    filesInfo,
}: {
    filesInfo: FileInfoType[];
    registry: Registry<T, S, F>;
    preview?: boolean;
    onRemove: (index: number) => void;
    options: UIOptionsType<T, S, F>;
}) {
    if (filesInfo.length === 0) {
        return null;
    }

    return (
        <ul className="file-info mt-2">
            {filesInfo.map((fileInfo, key) => {
                const { name } = fileInfo;
                return (
                    <li key={key} className="p-2 border-1 border-gray-100 my-4 max-w-sm">
                        <div className="typography-content-body-sm-bold flex gap-2 ">
                            <UploadIcon height={25} width={25} />
                            {name !== undefined ? name : 'No file chosen'}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

function extractFileInfo(dataURLs: string[]): FileInfoType[] {
    return dataURLs.reduce((acc, dataURL) => {
        if (!dataURL) {
            return acc;
        }
        try {
            const { blob, name } = dataURItoBlob(dataURL);
            return [
                ...acc,
                {
                    dataURL,
                    name: name,
                    size: blob.size,
                    type: blob.type,
                },
            ];
        } catch (e) {
            // Invalid dataURI, so just ignore it.
            return acc;
        }
    }, [] as FileInfoType[]);
}

function FileWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(widgetProps: WidgetProps<T, S, F>) {
    const { disabled, readonly, required, multiple, onChange, value, options, name, registry, schema, uiSchema, formContext } = widgetProps;

    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'general' });
    const BaseInputTemplate = getTemplate<'BaseInputTemplate', T, S, F>('BaseInputTemplate', registry, options);
    const sideSheet = useSideSheetContext();

    const { showFiles } = getUiOptions<T, S, F>(uiSchema);

    const [toastMessage, setToastMessage] = useState<any>(undefined);
    const [toastVariant, setToastVariant] = useState<any>(undefined);

    const onSubmit = (data: EDSDocumentRequestBody, files: any) => {
        const attachments = [...(formContext?.customData?.attachments || [])];
        const failedUploads: string[] = []; // Track failed uploads

        const uploadPromises = Object.keys(files).map(async (key: string) => {
            const { blob, name } = dataURItoBlob(files[key]);
            const metaData = {
                ...data,
                sourceFileName: name,
                documentDate: dayjs().format(EDS_DATE_DISPLAY_FORMAT),
                fileType: getFileSubtype(blob),
                docClassification: SearchRequest.documentClassification.INBOUND,
                sourceSystem: SourceSystem.ZL,
                zinniaLiveCaseId: formContext?.customData?.caseId,
                parentCarrierCode: formContext?.customData?.carrier ?? '',
                correlationId: formContext?.correlationId || '',
            };
            try {
                const response = await uploadDocumentV2(metaData, files[key]);

                if (response?.documentId) {
                    const attachment = {
                        documentId: response.documentId,
                        documentCategory: metaData?.docCategory,
                        documentType: metaData?.documentType,
                        documentExt: metaData?.fileType,
                        documentName: metaData?.documentTypeDescription || name || '',
                    };
                    attachments.push(attachment);

                    const task = formContext?.customData?.task;
                    return await attachFilesToMappedDocuments(attachment, task, formContext?.correlationId || '');
                } else {
                    failedUploads.push(name); // Add the file name to the failed uploads list
                }
            } catch (error) {
                // Log the error and track the failed file
                browserLogError('FileWidget: Error uploading document:', {
                    ...parseErrorInformation(error),
                });
                failedUploads.push(name); // Add the file name to the failed uploads list
            }
        });

        Promise.allSettled(uploadPromises).then(() => {
            if (formContext?.setCustomData) {
                formContext.setCustomData({ attachments: attachments });
            }

            if (failedUploads.length > 0) {
                // Notify the user about failed uploads
                setToastVariant(ToastVariant.Error);
                setToastMessage(t(`fileUploadToastMessages.fileUploadError`, { failedUploads: failedUploads.join(', ') }));
            } else {
                setToastVariant(ToastVariant.Success);
                setToastMessage(t(`fileUploadToastMessages.fileUploadSuccess`, {}));
            }

            sideSheet.onClose();
        });
    };

    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            if (!event.target.files) {
                return;
            }
            // Due to variances in themes, dealing with multiple files for the array case now happens one file at a time.
            // This is because we don't pass `multiple` into the `BaseInputTemplate` anymore. Instead, we deal with the single
            // file in each event and concatenate them together ourselves
            processFiles(event.target.files).then(filesInfoEvent => {
                const newValue = filesInfoEvent.map(fileInfo => fileInfo.dataURL);

                let values = '';
                if (multiple) {
                    values = value?.concat(newValue);
                } else {
                    values = newValue[0] || '';
                    // For single file upload, just take the first element if newValue is an array
                }

                const content = (
                    <div className="p-6">
                        <FilesInfo<T, S, F>
                            filesInfo={filesInfoEvent}
                            onRemove={rmFile}
                            registry={registry}
                            preview={options.filePreview}
                            options={values as any}
                        />

                        <FileAttachmentComponent
                            carrier={formContext?.customData?.carrier || ''}
                            onClose={() => sideSheet.onClose()}
                            onSubmit={(formData: EDSDocumentRequestBody) => onSubmit(formData, newValue)}
                        />
                    </div>
                );
                ``;

                sideSheet.changeSideSheetContent(t('uploadDocument'), content);
                sideSheet.handleOpen(true);
            });
        },
        [multiple, onChange, value, onSubmit, options.filePreview]
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

    const rmFile = useCallback(
        (index: number) => {
            if (multiple) {
                const newValue = value.filter((_: any, i: number) => i !== index);
                onChange(newValue);
            } else {
                onChange(undefined);
            }
        },
        [multiple, value, onChange]
    );
    const filesInfo = useMemo(() => extractFileInfo(Array.isArray(value) ? value : [value]), [value]);

    const readonlyClass = readonly ? '!cursor-not-allowed opacity-50' : '';
    return (
        <>
            <div className={`mt-1 ${readonlyClass}`}>
                <label htmlFor={widgetProps.id} className={`${style.customFileUpload} ${readonlyClass}`}>
                    {schema?.title ?? t('upload')}
                </label>
                <BaseInputTemplate
                    {...widgetProps}
                    disabled={disabled || readonly}
                    type="file"
                    required={value ? false : required}
                    onChangeOverride={handleChange}
                    value=""
                    accept={options.accept ? String(options.accept) : undefined}
                    className={`${style.input} ${readonlyClass}`}
                />
            </div>
            {showFiles && (
                <FilesInfo<T, S, F>
                    filesInfo={filesInfo}
                    onRemove={rmFile}
                    registry={registry}
                    preview={options.filePreview}
                    options={options}
                />
            )}
            {toastMessage && toastVariant && (
                <div className="fixed bottom-4 right-10 z-50">
                    <Toast variant={toastVariant}>{toastMessage}</Toast>
                </div>
            )}
        </>
    );
}

export default FileWidget;
