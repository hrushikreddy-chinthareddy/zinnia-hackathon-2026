import { getTemplate, WidgetProps } from '@rjsf/utils';
import { Toast } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { useFileUpload } from '@deps/hooks/useFileUpload';
import { ActionTypes } from '@deps/models/case/task';
import { TaskDocument } from '@deps/models/case/task-instance';

import FileAttachmentComponent from './file-attachment.component';
import { UploadContextData } from './file-widget';
import style from './file-widget.module.css';
import { FilesInfo, FileInfoType } from './files-info';
import { processFiles } from './utils';

export interface FileUploadComponentProps {
    setAttachments: (file: TaskDocument, operationType?: ActionTypes) => void;
    widgetProps?: Partial<WidgetProps>;
    attachments?: TaskDocument[];
    isStandalone?: boolean;
    standaloneBehavior?: 'preview' | 'direct';
    onSubmitStandalone?: (files: FileList) => void;
    onUploadComplete?: (docs: TaskDocument[]) => void;

    openChild?: (title: string, node: React.ReactNode) => void;
    updateChild?: (title: string, node: React.ReactNode) => void;
    closeChild?: () => void;

    disabled?: boolean;
    readonly?: boolean;
    multiple?: boolean;
    accept?: string;
    contextData?: UploadContextData;
}

export default function FileUploadComponent({
    setAttachments,
    widgetProps,
    contextData,
    isStandalone = false,
    standaloneBehavior,
    onSubmitStandalone,
    onUploadComplete,
    openChild,
    updateChild,
    closeChild,
    disabled,
    readonly,
    multiple,
    accept,
}: FileUploadComponentProps) {
    const { t } = useTranslation('common', { keyPrefix: 'general' });
    const sideSheet = useSideSheetContextLegacy();

    // --- child-layer adapter
    const hasSecondary =
        typeof (sideSheet as any).openSecondarySideSheet === 'function' &&
        typeof (sideSheet as any).changeSecondarySideSheetContent ===
            'function' &&
        typeof (sideSheet as any).closeSecondarySideSheet === 'function';

    const openChildLayer = useCallback(
        (title: string, node: React.ReactNode) => {
            if (typeof openChild === 'function') return openChild(title, node);
            if (hasSecondary)
                return (sideSheet as any).openSecondarySideSheet(title, node);
            sideSheet.changeSideSheetContent(title, node);
            sideSheet.handleOpen(true);
        },
        [openChild, hasSecondary, sideSheet]
    );

    const updateChildLayer = useCallback(
        (title: string, node: React.ReactNode) => {
            if (typeof updateChild === 'function')
                return updateChild(title, node);
            if (hasSecondary)
                return (sideSheet as any).changeSecondarySideSheetContent(
                    title,
                    node
                );
            sideSheet.changeSideSheetContent(title, node);
        },
        [updateChild, hasSecondary, sideSheet]
    );

    const closeChildLayer = useCallback(() => {
        if (typeof closeChild === 'function') return closeChild();
        if (hasSecondary) return (sideSheet as any).closeSecondarySideSheet();
        sideSheet.onClose?.() ?? sideSheet.handleOpen(false);
    }, [closeChild, hasSecondary, sideSheet]);

    const [filesInfoEvent, setFilesInfoEvent] = useState<FileInfoType[] | null>(
        null
    );

    const { id, required, value, options, registry, formContext, onChange } =
        widgetProps ?? {};

    const BaseInputTemplate = registry
        ? getTemplate('BaseInputTemplate', registry, options)
        : undefined;

    const { onSubmit, loading, toastMessage, toastVariant } = useFileUpload({
        formContext,
        contextData,
        setAttachments,
        onUploadComplete,
    });

    const rmFile = useCallback(
        (index: number) => {
            const files = Array.isArray(value) ? value : [];
            const targetFile = files[index] as TaskDocument | undefined;
            if (!targetFile) {
                return;
            }
            setAttachments(targetFile, ActionTypes.Remove);
            const newValue = files.filter((_, i) => i !== index);
            onChange?.(newValue);
        },
        [value, setAttachments, onChange]
    );

    const handleChange = useCallback(
        async (event: ChangeEvent<HTMLInputElement>) => {
            if (!event.target.files) return;

            if (
                isStandalone &&
                standaloneBehavior === 'direct' &&
                typeof onSubmitStandalone === 'function'
            ) {
                onSubmitStandalone(event.target.files);
                return;
            }

            const processed = await processFiles(event.target.files);
            setFilesInfoEvent(processed);

            const newValue = processed
                .map((f) => f.dataURL)
                .filter((v): v is string => Boolean(v));

            const content = (
                <div className="p-6">
                    <FilesInfo filesInfo={processed} onRemove={rmFile} />
                    <FileAttachmentComponent
                        carrier={
                            formContext?.customData?.carrier ||
                            contextData?.carrier ||
                            ''
                        }
                        onClose={closeChildLayer}
                        onSubmit={(formData) =>
                            onSubmit(formData, newValue, closeChildLayer)
                        }
                        loader={loading}
                    />
                </div>
            );

            openChildLayer(t('uploadDocument'), content);
        },
        [
            isStandalone,
            standaloneBehavior,
            onSubmitStandalone,
            t,
            formContext,
            contextData,
            rmFile,
            onSubmit,
            loading,
            openChildLayer,
            closeChildLayer,
        ]
    );

    useEffect(() => {
        if (!filesInfoEvent) return;

        const newValue = filesInfoEvent
            .map((f) => f.dataURL)
            .filter((v): v is string => Boolean(v));

        const updatedContent = (
            <div className="p-6">
                <FilesInfo filesInfo={filesInfoEvent} onRemove={rmFile} />
                <FileAttachmentComponent
                    carrier={
                        formContext?.customData?.carrier ||
                        contextData?.carrier ||
                        ''
                    }
                    initialMetaData={contextData?.defaultMeta}
                    onClose={closeChildLayer}
                    onSubmit={(formData) =>
                        onSubmit(formData, newValue, closeChildLayer)
                    }
                    loader={loading}
                />
            </div>
        );

        updateChildLayer(t('uploadDocument'), updatedContent);
    }, [
        filesInfoEvent,
        loading,
        formContext,
        contextData,
        onSubmit,
        rmFile,
        updateChildLayer,
        closeChildLayer,
        t,
    ]);

    const readOnlyClassName = clsx({
        'cursor-pointer': !readonly,
        '!border-gray-300 !text-gray-200': readonly,
    });

    return (
        <>
            <div className="mt-1">
                {(() => {
                    const inputId = id ?? 'file-upload-input';

                    return (
                        <>
                            <label
                                htmlFor={inputId}
                                className={clsx(
                                    style.customFileUpload,
                                    readOnlyClassName
                                )}
                            >
                                {t('fileUpload.upload')}
                            </label>
                            {BaseInputTemplate ? (
                                <BaseInputTemplate
                                    {...(widgetProps as WidgetProps)}
                                    id={inputId}
                                    disabled={disabled || readonly}
                                    type="file"
                                    required={value ? false : required}
                                    onChangeOverride={handleChange}
                                    value=""
                                    accept={
                                        options?.accept
                                            ? String(options.accept)
                                            : accept
                                    }
                                    className={style.input}
                                />
                            ) : (
                                <input
                                    id={inputId}
                                    type="file"
                                    onChange={handleChange}
                                    disabled={disabled || readonly}
                                    multiple={multiple}
                                    accept={accept}
                                    className={clsx(
                                        style.input,
                                        'block w-full cursor-pointer border border-gray-200 p-2 rounded-md text-sm'
                                    )}
                                />
                            )}
                        </>
                    );
                })()}
            </div>

            {/* Toast notifications */}
            {toastMessage && toastVariant && (
                <div className="fixed bottom-4 right-10 z-50">
                    <Toast variant={toastVariant}>{toastMessage}</Toast>
                </div>
            )}
        </>
    );
}
