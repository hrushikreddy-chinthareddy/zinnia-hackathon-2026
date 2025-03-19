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
import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { csrApiHelper } from '@deps/helpers/csr-api-helper';
import { replacePlaceholders } from '@deps/helpers/value-placement.helper';
import { ApiProps, FormMetadata } from '@deps/models/case/task';
import { uploadDocumentV2 } from '@deps/queries/api/documents';
import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { ReactComponent as UploadIcon } from '@deps/styles/elements/icons/files/upload.svg';
import { EDS_DATE_DISPLAY_FORMAT } from '@deps/types/constants';

const baseUrl = baseAppUrl + '/api/';

import FileAttachmentComponent from './file-attachment.component';
import style from './file-widget.module.css';

import { Loader } from '@zinnia/bloom/components';

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

export function FilesInfo<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
    filesInfo,
    registry,
    options,
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
    const { translateString } = registry;

    const { RemoveButton } = getTemplate<'ButtonTemplates', T, S, F>('ButtonTemplates', registry, options);

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
                        {/* <div>{translateString(TranslatableString.FilesInfo, [name, type, String(size)])}</div> */}
                        {/* {preview && <FileInfoPreview<T, S, F> fileInfo={fileInfo} registry={registry} />} */}
                        {/* <RemoveButton onClick={handleRemove} registry={registry} /> */}
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

    const [attachmentSchema, setAttachmentSchema] = useState<FormMetadata | null>(null);
    const [loader, setLoader] = useState(false);
    const { props, showFiles } = getUiOptions<T, S, F>(uiSchema);

    const { apiUrl, apiMethod } = typeof props === 'object' ? (props as ApiProps) : ({} as ApiProps);

    const onSubmit = (data: any, files: any) => {
        const attachments = [...(formContext?.customData?.attachments || [])];
        const uploadedFiles: string[] = [];

        const uploadPromises = Object.keys(files).map(key => {
            const { blob, name } = dataURItoBlob(files[key]);
            const processedData = replacePlaceholders(data, formContext ?? {});
            const metaData = {
                ...processedData,
                sourceFileName: name,
                documentDate: dayjs().format(EDS_DATE_DISPLAY_FORMAT),
                fileType: blob.type,
            };
            return uploadDocumentV2(metaData, files[key], formContext?.correlationId || '').then(response => {
                if (response?.documentId) {
                    const attachment = {
                        documentId: response.documentId,
                        documentCategory: metaData?.docCategory,
                        documentType: metaData?.documentType,
                        documentExt: metaData?.fileType,
                        documentName: name || '',
                    };
                    attachments.push(attachment);
                    uploadedFiles.push(files[key]);
                }
            });
        });

        Promise.allSettled(uploadPromises).then(results => {
            if (formContext?.setCustomData) {
                const values = value?.concat(uploadedFiles);
                multiple ? onChange(values) : onChange(files[0]);
                formContext.setCustomData({ attachments: attachments });
            }
            sideSheet.onClose();
        });
    };

    useEffect(() => {
        const getAttachmentSchema = async () => {
            try {
                setLoader(true);
                const url = `${baseUrl}${apiUrl}`;

                const { data } = await client[apiMethod ?? 'get']<FormMetadata, AxiosResponse>(url);
                if (!data) return;

                const apiProps = typeof props === 'object' ? (data?.uiSchema?.options?.['ui:props'] as ApiProps) : ({} as ApiProps);
                if (apiProps?.apiUrl) {
                    await csrApiHelper(apiProps, { ...formContext?.customData }).then(response => {
                        data.formSchema.definitions[apiProps?.dataKey] = response;
                    });
                }

                setAttachmentSchema(data);
            } catch (err) {
                console.log('🚀 ~ getAttachmentSchema ~ err:', err);
            } finally {
                setLoader(false);
            }
        };
        getAttachmentSchema();
    }, [apiMethod, apiUrl]);

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

                        {attachmentSchema && (
                            <FileAttachmentComponent
                                schema={attachmentSchema}
                                formData={{}}
                                onClose={() => sideSheet.onClose()}
                                onSubmit={(formData: any) => onSubmit(formData, newValue)}
                            />
                        )}
                    </div>
                );

                sideSheet.changeSideSheetContent(t('uploadDocument'), content);
                sideSheet.handleOpen(true);
            });
        },
        [attachmentSchema, multiple, onChange, value, onSubmit, options.filePreview]
    );

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
    return (
        <>
            {loader ? (
                <Loader />
            ) : (
                <div className="mt-1">
                    <label htmlFor={widgetProps.id} className={style.customFileUpload}>
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
                        className={style.input}
                    />
                </div>
            )}
            {showFiles && (
                <FilesInfo<T, S, F>
                    filesInfo={filesInfo}
                    onRemove={rmFile}
                    registry={registry}
                    preview={options.filePreview}
                    options={options}
                />
            )}
        </>
    );
}

export default FileWidget;
