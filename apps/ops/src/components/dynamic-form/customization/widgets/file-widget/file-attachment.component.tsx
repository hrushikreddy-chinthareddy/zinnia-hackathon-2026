import { AssistiveText, AssistiveTextVariant, Button, Checkbox } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';

import { ButtonSize } from '@deps/components/button/button';
import Select from '@deps/components/select/select';
import { EDSDocumentRequestBody } from '@deps/models/case/document';
import { getDocumentMetadataV3 } from '@deps/queries/api/client/documents/v3/metadata';
import { DocumentAccessLevel, DocumentMetadata } from '@deps/types/documents-v3';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

export type FileAttachmentComponentProps = {
    carrier: string;
    onClose: () => void;
    onSubmit: (data: EDSDocumentRequestBody) => void;
};

const FileAttachmentComponent = ({ carrier, onSubmit, onClose }: FileAttachmentComponentProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'general.fileUpload' });
    const [metadata, setMetadata] = useState<DocumentMetadata[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<any>([]);
    const [documentTypeOptions, setDocumentTypeOptions] = useState<any>([]);
    const [formNumberOptions, setFormNumberOptions] = useState<any>([]);
    const [currentFormData, setCurrentFormData] = useState<EDSDocumentRequestBody>({} as EDSDocumentRequestBody);
    const [restricted, setRestricted] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const limit = 10;
    const offset = 0;

    useEffect(() => {
        const seen = new Set();
        const options = metadata
            .map(doc => ({
                label: doc.documentCategory,
                value: doc.documentCategoryKey,
            }))
            .filter(option => {
                const key = option.value;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

        setCategoryOptions(options);
    }, [metadata]);

    useEffect(() => {
        const getDocumentMetadata = async () => {
            try {
                const { data: metadata } = await getDocumentMetadataV3(
                    {
                        parentCarrierCode: carrier || '',
                    },
                    limit,
                    offset
                );
                metadata && setMetadata(metadata || []);
            } catch (error) {
                browserLogError('Error getting document metadata', {
                    ...parseErrorInformation(error),
                    carrier,
                });
                setError(t('error'));
            }
        };
        getDocumentMetadata();
    }, [carrier]);

    const onSubmitHandler = useCallback(() => {
        onSubmit(currentFormData);
    }, [currentFormData, onSubmit]);

    const handleDocTypeSelection = (value: string) => {
        const seen = new Set();
        setCurrentFormData({ ...currentFormData, docCategory: value, documentType: '', formNumber: '' });

        setDocumentTypeOptions(
            metadata
                .filter((option: any) => option.documentCategoryKey === value)
                .reduce((acc: any[], option: any) => {
                    const key = option.documentType;
                    if (!seen.has(key)) {
                        seen.add(key);
                        acc.push({ label: key, value: key });
                    }
                    return acc;
                }, [])
        );
    };

    const handleDocumentTypeSelection = (value: string) => {
        setCurrentFormData({ ...currentFormData, documentType: value });

        const formNumberOptions = metadata
            .filter((option: any) => option.documentType === value && option.formNumber !== '')
            ?.map((option: any) => ({ label: option.formNumber, value: option.formNumber }));
        setFormNumberOptions(formNumberOptions || []);
    };

    const handleFormNumberSelection = (value: string) => {
        const documentTypeDescription = metadata.find((option: any) => option.formNumber === value)?.documentTypeDescription;
        setCurrentFormData({ ...currentFormData, formNumber: value, documentTypeDescription });
    };

    useEffect(() => {
        setCurrentFormData({
            ...currentFormData,
            docAccessLevel: restricted ? DocumentAccessLevel.CARRIER_ONLY : DocumentAccessLevel.CLIENT_COPY,
        });
    }, [restricted, currentFormData]);

    const handleRestrictedChange = () => {
        setRestricted(!restricted);
    };

    return (
        <div className="flex flex-col">
            <div className="flex flex-col gap-4">
                <Select
                    label={t('documentCategory') as string}
                    options={categoryOptions}
                    value={currentFormData?.docCategory}
                    onChange={handleDocTypeSelection}
                    placeholder={t('select') as string}
                    required={true}
                />

                <Select
                    label={t('documentType') as string}
                    options={documentTypeOptions}
                    value={currentFormData?.documentType}
                    onChange={handleDocumentTypeSelection}
                    placeholder={t('select') as string}
                    required={true}
                />
                {formNumberOptions.length > 0 && (
                    <Select
                        label={t('formNumber') as string}
                        options={formNumberOptions}
                        value={currentFormData?.formNumber}
                        onChange={handleFormNumberSelection}
                        placeholder={t('select') as string}
                    />
                )}

                <Checkbox id="restricted" onClick={handleRestrictedChange} isCheckedByDefault={restricted}>
                    {t('restricted') as string}
                </Checkbox>

                <div className="flex gap-2">
                    <Button
                        aria-label={t('continue') as string}
                        disabled={currentFormData?.docCategory === '' || currentFormData?.documentType === ''}
                        mode="primary"
                        size={ButtonSize.Small}
                        type="submit"
                        onClick={onSubmitHandler}
                    >
                        {t('upload')}
                    </Button>

                    <Button aria-label={t('cancel') as string} mode="secondary" size={ButtonSize.Small} onClick={onClose}>
                        {t('cancel')}
                    </Button>
                </div>

                {error && <AssistiveText text={error} variant={AssistiveTextVariant.Error} className="mt-2" />}
            </div>
        </div>
    );
};

export default FileAttachmentComponent;
