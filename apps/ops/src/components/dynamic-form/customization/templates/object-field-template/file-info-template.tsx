import { ArrayFieldTemplateProps } from '@rjsf/utils';
import clsx from 'clsx';
import { ReactComponent as UploadIcon } from '@deps/styles/elements/icons/files/upload.svg';
function FileInfoTemplate(props: ArrayFieldTemplateProps) {
    const { items, formData } = props;

    return (
        <div className={clsx('flex ')}>
            <ul className="file-info">
                {formData.map((fileInfo: any, index: number) => {
                    const { documentId } = fileInfo;
                    return (
                        <li key={index} className="p-2 border-1 border-gray-100 my-4 max-w-sm">
                            <div className="typography-content-body-sm-bold flex gap-2">
                                <UploadIcon height={25} width={25} />
                                <div>{documentId ?? ''}</div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default FileInfoTemplate;
