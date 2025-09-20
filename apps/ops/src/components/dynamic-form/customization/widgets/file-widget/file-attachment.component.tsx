import { Button } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';

import { ButtonSize } from '@deps/components/button/button';
import CustomLoader from '@deps/components/loader/customLoader';
import { EDSDocumentRequestBody } from '@deps/models/case/document';

import DocumentMetadataFilter from '../../components/document-metadata/metadata-filter';

export type FileAttachmentComponentProps = {
    carrier: string;
    onClose: () => void;
    onSubmit: (data: EDSDocumentRequestBody) => void;
    loader: boolean;
};

const FileAttachmentComponent = ({
    carrier,
    onSubmit,
    onClose,
    loader,
}: FileAttachmentComponentProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'general.fileUpload',
    });
    const [currentMetaData, setCurrentMetaData] =
        useState<EDSDocumentRequestBody>({} as EDSDocumentRequestBody);
    const [localLoading, setLocalLoading] = useState<boolean>(loader);

    // Sync local loading state with the prop from parent
    useEffect(() => {
        setLocalLoading(loader);
    }, [loader]);

    const onSubmitHandler = () => {
        setLocalLoading(true); // Set loading immediately on button click
        onSubmit(currentMetaData);
    };

    const setMetadataHandler = (data: EDSDocumentRequestBody) => {
        setCurrentMetaData(data);
    };

    return (
        <>
            <DocumentMetadataFilter
                carrier={carrier}
                currentMetaData={currentMetaData}
                setCurrentMetaData={setMetadataHandler}
            />
            <div className="flex gap-2 mt-4">
                <Button
                    aria-label={t('upload') as string}
                    disabled={
                        !currentMetaData?.docCategory ||
                        !currentMetaData?.documentType ||
                        localLoading ||
                        loader
                    }
                    mode="primary"
                    size={ButtonSize.Small}
                    type="submit"
                    onClick={onSubmitHandler}
                >
                    {localLoading || loader ? (
                        <>
                            <CustomLoader /> {t('upload')}
                        </>
                    ) : (
                        <>{t('upload')}</>
                    )}
                </Button>

                <Button
                    aria-label={t('cancel') as string}
                    mode="secondary"
                    size={ButtonSize.Small}
                    onClick={onClose}
                >
                    {t('cancel')}
                </Button>
            </div>
        </>
    );
};

export default FileAttachmentComponent;
