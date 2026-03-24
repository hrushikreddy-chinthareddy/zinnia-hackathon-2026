import { Button } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { ButtonSize } from '@deps/components/button/button';
import CustomLoader from '@deps/components/loader/customLoader';
import { EDSDocumentRequestBody } from '@deps/models/case/document';

import DocumentMetadataFilter from '../../components/document-metadata/metadata-filter';

export type FileAttachmentComponentProps = {
    carrier: string;
    onClose: () => void;
    onSubmit: (data: EDSDocumentRequestBody) => void;
    loader: boolean;
    initialMetaData?: Partial<EDSDocumentRequestBody>;
};

const FileAttachmentComponent = ({
    carrier,
    onSubmit,
    onClose,
    loader,
    initialMetaData,
}: FileAttachmentComponentProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'general.fileUpload',
    });
    const [currentMetaData, setCurrentMetaData] =
        useState<EDSDocumentRequestBody>(
            () =>
                ({
                    ...(initialMetaData as Partial<EDSDocumentRequestBody>),
                } as EDSDocumentRequestBody)
        );

    useEffect(() => {
        if (initialMetaData) {
            setCurrentMetaData((prev) => ({ ...prev, ...initialMetaData }));
        }
    }, [initialMetaData]);

    const onSubmitHandler = () => {
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
                        loader
                    }
                    mode="primary"
                    size={ButtonSize.Small}
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        onSubmitHandler();
                    }}
                >
                    {loader ? (
                        <>
                            <CustomLoader size="small" /> {t('upload')}
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
