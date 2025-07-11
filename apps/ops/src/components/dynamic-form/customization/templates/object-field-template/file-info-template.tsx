import {
    ArrayFieldTemplateProps,
    FormContextType,
    UiSchema,
} from '@rjsf/utils';
import { MetadataSearchResponse } from '@zinnia/api-types/types/documents-v3';
import { Icon, IconType, ToastVariant, Toast } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { updateTask } from '@deps/containers/task-container/task.helpers';
import { ActionTypes, INTERVAL } from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import { ReactComponent as UploadIcon } from '@deps/styles/elements/icons/files/upload.svg';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';
function FileInfoTemplate(props: ArrayFieldTemplateProps) {
    const { items: _items, uiSchema, readonly } = props;
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'general',
    });
    let { formData } = props;
    if (formData.length === 0) {
        const formContextOptions: any =
            (uiSchema as UiSchema)?.['ui:options']?.formContext ?? {};
        if (
            formContextOptions &&
            props.formContext[formContextOptions?.keyName]?.[
                formContextOptions?.listName
            ]
        ) {
            const data =
                props.formContext[formContextOptions?.keyName][
                    formContextOptions?.listName
                ];
            formData = data;
        }
    }

    return (
        <FileInfoComponent
            files={formData}
            readonly={readonly || false}
            formContext={props.formContext}
        />
    );
}

export default FileInfoTemplate;

export type FileInfoComponentProps = {
    files: ({ documentName: string } & MetadataSearchResponse)[];
    readonly: boolean;
    formContext: FormContextType;
    showDelete?: boolean;
};

export const FileInfoComponent = ({
    files,
    readonly,
    formContext,
    showDelete = true,
}: FileInfoComponentProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'general',
    });
    const [toastMessage, setToastMessage] = useState<string | undefined>(
        undefined
    );
    const [toastVariant, setToastVariant] = useState<ToastVariant | undefined>(
        undefined
    );
    const removeAttachment = async (fileInfo: MetadataSearchResponse) => {
        if (readonly) {
            return;
        }
        let attachments = [...(formContext?.customData?.attachments || [])];
        try {
            const updatedMappedDocuments =
                attachments.map((item: any) => {
                    return {
                        ...item,
                        operationType:
                            item.documentId === fileInfo.documentId
                                ? ActionTypes.Remove
                                : null,
                    };
                }) || [];
            attachments = attachments.filter(
                (item) => item.documentId !== fileInfo.documentId
            );
            if (formContext?.setCustomData) {
                formContext.setCustomData({ attachments });
            }
            const updatedTask = {
                ...formContext?.customData?.task,
                data: {
                    ...formContext?.customData?.task?.data,
                    attachments,
                },
                mappedDocuments: [
                    ...(formContext?.customData?.task?.mappedDocuments || []),
                    ...updatedMappedDocuments,
                ],
            };
            const success = await updateTask(
                updatedTask,
                formContext?.customData?.correlationId,
                TaskStatus.InProgress
            );
            if (success) {
                setToastVariant(ToastVariant.Success);
                setToastMessage(
                    t(`fileUploadToastMessages.fileDeletedSuccess`) as string
                );
            } else {
                setToastVariant(ToastVariant.Error);
                setToastMessage(
                    t(`fileUploadToastMessages.fileDeletedError`) as string
                );
            }
        } catch (error) {
            if (formContext?.setCustomData) {
                formContext.setCustomData({ attachments });
            }
            browserLogError('Error while removing the document', {
                ...parseErrorInformation(error),
            });
        }
    };

    useEffect(() => {
        if (toastMessage && toastVariant) {
            const timer = setTimeout(() => {
                setToastMessage(undefined);
                setToastVariant(undefined);
            }, INTERVAL);
            return () => clearTimeout(timer);
        }
    }, [toastMessage, toastVariant]);
    const className = clsx('flex ', {
        'cursor-pointer': !readonly,
        '!border-gray-300 !text-gray-100': readonly,
    });

    return (
        <div className={clsx('flex ')}>
            <ul className="file-info">
                {files?.map((fileInfo: any, index: number) => {
                    const { documentId, documentName } = fileInfo;
                    return (
                        <li
                            key={index}
                            className="p-2 border-1 border-gray-100 my-4 max-w-sm"
                        >
                            <div className="flex justify-between">
                                <div className="typography-content-body-sm-bold flex gap-2">
                                    <UploadIcon height={25} width={25} />
                                    <div>
                                        {documentName || documentId || ''}
                                    </div>
                                </div>
                                {showDelete && (
                                    <span
                                        onClick={() =>
                                            removeAttachment(fileInfo)
                                        }
                                        className={`ml-4 ${className}`}
                                    >
                                        <Icon
                                            type={IconType.CLOSE}
                                            height={25}
                                            width={25}
                                        />
                                    </span>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
            {toastMessage && toastVariant && (
                <div className="fixed bottom-4 right-10 z-50">
                    <Toast variant={toastVariant}>{toastMessage}</Toast>
                </div>
            )}
        </div>
    );
};
