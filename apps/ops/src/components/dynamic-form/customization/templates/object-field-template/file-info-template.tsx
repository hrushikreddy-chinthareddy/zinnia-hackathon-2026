import { ArrayFieldTemplateProps } from '@rjsf/utils';
import clsx from 'clsx';
import { ReactComponent as UploadIcon } from '@deps/styles/elements/icons/files/upload.svg';
function FileInfoTemplate(props: ArrayFieldTemplateProps) {
    let { items, formData, uiSchema } = props;

    if (formData.length === 0) {
        const formContextOptions: any = uiSchema?.['ui:options']?.formContext;
        if (formContextOptions && props.formContext[formContextOptions?.keyName][formContextOptions?.listName]) {
            const data = props.formContext[formContextOptions?.keyName][formContextOptions?.listName];
            formData = data;
        }
    }

    return (
        <div className={clsx('flex ')}>
            <ul className="file-info">
                {formData.map((fileInfo: any, index: number) => {
                    const { documentId, documentName } = fileInfo;
                    return (
                        <li key={index} className="p-2 border-1 border-gray-100 my-4 max-w-sm">
                            <div className="typography-content-body-sm-bold flex gap-2">
                                <UploadIcon height={25} width={25} />
                                <div>{documentName || documentId || ''}</div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default FileInfoTemplate;
