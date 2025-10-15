import {
    AssistiveText,
    AssistiveTextVariant,
    Checkbox,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { memo, useEffect, useState } from 'react';

import Select from '@deps/components/select/select';
import { SimpleOption } from '@deps/components/select/select.helpers';
import { EDSDocumentRequestBody } from '@deps/models/case/document';
import { getDocumentMetadataV3 } from '@deps/queries/api/client/documents/v3/metadata';
import {
    DocumentAccessLevel,
    DocumentMetadata,
} from '@deps/types/documents-v3';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

export type DocumentMetadataFilterProps = {
    carrier: string;
    showRestricted?: boolean;
    currentMetaData: EDSDocumentRequestBody;
    setCurrentMetaData: (data: EDSDocumentRequestBody) => void;
    isRequired?: boolean;
    readonly?: boolean;
};

const DocumentMetadataFilter = memo(
    ({
        carrier,
        currentMetaData,
        setCurrentMetaData,
        showRestricted = true,
        isRequired = true,
        readonly = false,
    }: DocumentMetadataFilterProps) => {
        const { t } = useTranslation(undefined, {
            keyPrefix: 'general.fileUpload',
        });
        const [metadata, setMetadata] = useState<DocumentMetadata[]>([]);
        const [categoryOptions, setCategoryOptions] = useState<SimpleOption[]>(
            []
        );
        const [documentTypeOptions, setDocumentTypeOptions] = useState<
            SimpleOption[]
        >([]);
        const [formNumberOptions, setFormNumberOptions] = useState<
            SimpleOption[]
        >([]);

        const [restricted, setRestricted] = useState<boolean>(false);
        const [error, setError] = useState<string | null>(null);
        const limit = 100;
        const offset = 0;

        useEffect(() => {
            const seen = new Set();
            const options = metadata
                .map((doc) => ({
                    label: doc.documentCategory,
                    value: doc.documentCategoryKey,
                }))
                .filter((option) => {
                    const key = option.value;
                    if (!key || seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });

            setCategoryOptions(options);
        }, [metadata]);

        const handleDocTypeSelection = (value: string) => {
            const seen = new Set();
            setCurrentMetaData({
                ...currentMetaData,
                docCategory: value,
                documentType: '',
                formNumber: '',
            });

            setDocumentTypeOptions(
                metadata
                    .filter(
                        (option: any) => option.documentCategoryKey === value
                    )
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
            setCurrentMetaData({ ...currentMetaData, documentType: value });

            const formNumberOptions = metadata
                .filter(
                    (option: any) =>
                        option.documentType === value &&
                        option.formNumber !== ''
                )
                ?.map((option: any) => ({
                    label: option.formNumber,
                    value: option.formNumber,
                }));
            setFormNumberOptions(formNumberOptions || []);
        };

        const handleFormNumberSelection = (value: string) => {
            const documentTypeDescription = metadata.find(
                (option: any) => option.formNumber === value
            )?.documentTypeDescription;
            setCurrentMetaData({
                ...currentMetaData,
                formNumber: value,
                documentTypeDescription,
            });
        };

        const handleRestrictedChange = (currentSelection: boolean) => {
            setCurrentMetaData({
                ...currentMetaData,
                docAccessLevel: currentSelection
                    ? DocumentAccessLevel.CARRIER_ONLY
                    : DocumentAccessLevel.CLIENT_COPY,
            });

            setRestricted(currentSelection);
        };

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
        }, [carrier, t]);

        return (
            <div
                className="flex flex-col"
                role="group"
                aria-labelledby="document-metadata-heading"
            >
                <div className="flex flex-col gap-4">
                    <Select
                        label={t('documentCategory') as string}
                        options={categoryOptions}
                        value={currentMetaData?.docCategory || ''}
                        onChange={handleDocTypeSelection}
                        placeholder={t('select') as string}
                        required={isRequired}
                        disabled={readonly}
                        aria-required={isRequired ? 'true' : 'false'}
                        aria-invalid={
                            isRequired && !currentMetaData?.docCategory
                                ? 'true'
                                : 'false'
                        }
                        aria-label={t('documentCategory') as string}
                    />

                    <Select
                        label={t('documentType') as string}
                        options={documentTypeOptions}
                        value={currentMetaData?.documentType || ''}
                        onChange={handleDocumentTypeSelection}
                        placeholder={t('select') as string}
                        required={isRequired}
                        disabled={readonly}
                        aria-required={isRequired ? 'true' : 'false'}
                        aria-invalid={
                            isRequired && !currentMetaData?.documentType
                                ? 'true'
                                : 'false'
                        }
                        aria-label={t('documentType') as string}
                    />
                    {formNumberOptions.length ? (
                        <Select
                            label={t('formNumber') as string}
                            options={formNumberOptions}
                            value={currentMetaData?.formNumber || ''}
                            onChange={handleFormNumberSelection}
                            placeholder={t('select') as string}
                            disabled={readonly}
                            aria-required="false"
                            aria-label={t('formNumber') as string}
                        />
                    ) : null}

                    {showRestricted && (
                        <Checkbox
                            id="restricted"
                            onClick={() => {
                                handleRestrictedChange(!restricted);
                            }}
                            isCheckedByDefault={restricted}
                            isDisabled={readonly}
                            aria-describedby="restricted-description"
                        >
                            {t('restricted') as string}
                        </Checkbox>
                    )}

                    {error && (
                        <AssistiveText
                            text={error}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                            role="alert"
                            aria-live="assertive"
                        />
                    )}
                </div>
            </div>
        );
    }
);

DocumentMetadataFilter.displayName = 'DocumentMetadataFilter';

export default DocumentMetadataFilter;
