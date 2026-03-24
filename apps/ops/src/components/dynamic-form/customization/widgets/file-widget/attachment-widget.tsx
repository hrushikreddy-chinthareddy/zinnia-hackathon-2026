import { WidgetProps } from '@rjsf/utils';
import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { useAttachments } from '@deps/hooks/useAttachments';

import FileUploadComponent from './file-upload-component';
import style from './file-widget.module.css';
import FileListing from '../../components/file-listing/file-listing';
import { RJSFFileSearchField } from '../../components/file-search-field/rjsf-file-search-field';

function AttachmentWidget(widgetProps: WidgetProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'general',
    });
    const { value, onChange, formContext } = widgetProps;

    const { attachments, handleSetAttachments } = useAttachments({
        initialFiles: value || [],
        multiple: true, // This widget always handles multiple attachments
        onChange,
        formContext,
    });

    return (
        <>
            <div
                className="flex gap-2"
                role="group"
                aria-label={t('uploadDocument') as string}
            >
                <RJSFFileSearchField
                    attachments={attachments}
                    setAttachments={handleSetAttachments}
                    widgetProps={widgetProps}
                />
                <div className={style.orText} aria-hidden="true">
                    {t('fileUpload.or') as string}
                </div>
                <FileUploadComponent
                    widgetProps={widgetProps}
                    setAttachments={handleSetAttachments}
                    attachments={attachments}
                />
            </div>
            <FileListing
                attachments={attachments}
                setAttachments={handleSetAttachments}
                widgetProps={widgetProps}
            />
        </>
    );
}

export default AttachmentWidget;
