import { WidgetProps } from '@rjsf/utils';
import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';

import { ActionTypes } from '@deps/models/case/task';
import { TaskDocument } from '@deps/models/case/task-instance';
import { ReactComponent as UploadIcon } from '@deps/styles/elements/icons/files/upload.svg';

import { FileAttachmentProps } from '../../widgets/file-widget/file-widget';

export function FileListing({
    attachments,
    setAttachments,
    widgetProps = {} as WidgetProps,
}: FileAttachmentProps) {
    const { readonly } = widgetProps;

    const removeAttachment = async (attachment: TaskDocument) => {
        if (readonly) {
            return;
        }

        setAttachments(attachment, ActionTypes.Remove);
    };

    const className = clsx('flex ', {
        'cursor-pointer': !readonly,
        '!border-gray-300 !text-gray-100': readonly,
    });

    return (
        <div className={clsx('flex ')}>
            <ul className="file-info w-full">
                {attachments?.map((fileInfo: TaskDocument, index: number) => {
                    const { documentId, documentName } = fileInfo;

                    if (!documentId && !documentName) {
                        return null;
                    }
                    return (
                        <li
                            key={index}
                            className="p-2 border-1 border-gray-100 my-4 max-w-sm"
                        >
                            <div className="flex justify-between">
                                <div className="typography-content-body-sm-bold flex gap-2">
                                    <UploadIcon height={25} width={25} />
                                    {documentName || documentId}
                                </div>
                                <span
                                    onClick={() => removeAttachment(fileInfo)}
                                    className={`ml-4 ${className}`}
                                >
                                    <Icon
                                        type={IconType.CLOSE}
                                        height={25}
                                        width={25}
                                    />
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default FileListing;
