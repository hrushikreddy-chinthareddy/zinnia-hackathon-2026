import { IChangeEvent } from '@rjsf/core';
import {
    dataURItoBlob,
    FormContextType,
    GenericObjectType,
    getTemplate,
    Registry,
    RJSFSchema,
    StrictRJSFSchema,
    UIOptionsType,
    WidgetProps,
} from '@rjsf/utils';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { ReactComponent as UploadIcon } from '@deps/styles/elements/icons/files/upload.svg';

import style from './file-widget.module.css';
import { replacePlaceholders } from '@deps/helpers/value-placement.helper';
import { EDS_DATE_DISPLAY_FORMAT } from '@deps/types/constants';
import dayjs from 'dayjs';
import { uploadDocumentV2 } from '@deps/queries/api/documents';
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

function FileWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(props: WidgetProps<T, S, F>) {
    const { disabled, readonly, required, multiple, onChange, value, options, name, registry, schema, uiSchema, formContext } = props;

    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'general' });
    const BaseInputTemplate = getTemplate<'BaseInputTemplate', T, S, F>('BaseInputTemplate', registry, options);
    const sideSheet = useSideSheetContext();
    const [uploadSelection, setUploadSelection] = useState({});

    const onSubmit = useCallback(
        (data: any, files: any) => {
            const attachments = [...formContext?.customData?.attachments];
            Object.keys(files).map((key: any) => {
                const { blob, name } = dataURItoBlob(files[key]);
                const processedData = replacePlaceholders(data.formData, formContext ?? {});
                const metaData = {
                    ...processedData,
                    sourceFileName: name,
                    documentDate: dayjs().format(EDS_DATE_DISPLAY_FORMAT),
                    fileType: blob.type,
                    formType: 'NB Application',
                };

                uploadDocumentV2(metaData, files[key], formContext?.correlationId || '');
                attachments.push({ documentName: name, documentType: blob.type });
                formContext?.setCustomData && formContext.setCustomData({ attachments: attachments });
            });
        },
        [formContext, value]
    );

    const uploadChangeHandler = useCallback(
        (event: IChangeEvent<any, RJSFSchema, GenericObjectType>) => {
            setUploadSelection({ ...event.formData });
        },
        [setUploadSelection]
    );

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
                    onChange(value?.concat(newValue));
                } else {
                    values = newValue[0] ?? '';
                    // For single file upload, just take the first element if newValue is an array
                    onChange(newValue[0]);
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
                        <DynamicForm
                            taskMetadata={{
                                formSchema: (schema.items as any)?.upload as RJSFSchema | {} as RJSFSchema,
                                uiSchema: {
                                    options: {
                                        'ui:label': false,
                                    },
                                    zinniaLiveCaseId: {
                                        'ui:widget': 'hidden',
                                    },
                                    correlationId: {
                                        'ui:widget': 'hidden',
                                    },
                                    parentCarrierCode: {
                                        'ui:widget': 'hidden',
                                    },
                                    docClassification: {
                                        'ui:widget': 'hidden',
                                    },
                                    docAccessLevel: {
                                        'ui:widget': 'hidden',
                                    },
                                },
                            }}
                            onSubmit={(data: any) => onSubmit(data, values)}
                            formData={uploadSelection}
                            onChange={uploadChangeHandler}
                        />
                    </div>
                );

                sideSheet.changeSideSheetContent(t('uploadDocument'), content);
                sideSheet.handleOpen(true);
            });
        },
        [multiple, onChange, value, onSubmit, options.filePreview]
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
            <div className="mt-1">
                <label htmlFor={props.id} className={style.customFileUpload}>
                    {schema?.title ?? t('upload')}
                </label>
                <BaseInputTemplate
                    {...props}
                    disabled={disabled || readonly}
                    type="file"
                    required={value ? false : required}
                    onChangeOverride={handleChange}
                    value=""
                    accept={options.accept ? String(options.accept) : undefined}
                    className={style.input}
                />
            </div>
            {/* <FilesInfo<T, S, F>
                filesInfo={filesInfo}
                onRemove={rmFile}
                registry={registry}
                preview={options.filePreview}
                options={options}
            /> */}
        </>
    );
}

export default FileWidget;
