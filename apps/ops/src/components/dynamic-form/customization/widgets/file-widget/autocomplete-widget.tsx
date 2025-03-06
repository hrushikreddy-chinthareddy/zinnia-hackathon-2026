import { FormContextType, getUiOptions, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';
import { MetadataSearchResponse, SearchRequest } from '@zinnia/api-types/types/documents-v3';
import { IconType, Icon, AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { ChangeEvent, useEffect, useState, useRef } from 'react';

import ClickContainer from '@deps/components/click-container/click-container';
import inputStyles from '@deps/components/search/search-field-toggle/search-field-toggle.module.css';
import { searchDocumentsV3 } from '@deps/queries/api/client/documents/v3/search';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import style from './file-widget.module.css';
import { useTranslation } from 'react-i18next';
export default function AutoCompleteWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
    props: WidgetProps<T, S, F>
) {
    const {
        id,
        disabled,
        rawErrors,
        required,
        uiSchema,
        onChange,
        value,
        schema: { title },
        formContext,
        Placeholder,
    } = props;
    const { icon } = getUiOptions(uiSchema);

    const [documents, setDocuments] = useState<MetadataSearchResponse[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<MetadataSearchResponse[]>([]);
    const [inputValue, setInputValue] = useState<string>();
    const inputRef = useRef<HTMLDivElement>(null);
    const [fetchingDocuments, setFetchingDocuments] = useState<string>('');
    const [error, setError] = useState<boolean>(false);
    const { t } = useTranslation(undefined, { keyPrefix: 'taskManagementQueue' });

    const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        filterDocuments(value);
        setInputValue(value);
    };

    useEffect(() => {
        const fetchApiData = async (value: string) => {
            setFetchingDocuments('true');
            const searchBody: SearchRequest = {
                documentClassification: SearchRequest.documentClassification.INBOUND,
                zinniaLiveCaseId: formContext?.customData?.caseId,
                parentCarrierCode: formContext?.customData?.carrier,
            };
            try {
                const { data, error } = await searchDocumentsV3({ limit: 25, offset: 0, searchBody });
                if (data?.documents) {
                    setDocuments(data?.documents);
                } else if (error) {
                    browserLogError('fetchLinkedDocuments::Error fetching linked documents', {
                        ...parseErrorInformation(error),
                        caseId: formContext?.customData?.caseId,
                        carrier: formContext?.customData?.carrier,
                        fileName: 'autocomplete-widget-fetchApiData',
                    });
                }
            } catch (err) {
                browserLogError('fetchLinkedDocuments::Unexpected error occurred', {
                    ...parseErrorInformation(err),
                    caseId: formContext?.caseId,
                    carrier: formContext?.carrier,
                    fileName: 'autocomplete-widget::fetchApiData',
                });
            } finally {
                setFetchingDocuments('false');
            }
        };
        fetchApiData(value);
    }, []);

    const onFocusHandler = () => {
        filterDocuments(inputValue ?? '');
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
            setFilteredDocuments([]);
        }
    };

    const filterDocuments = (searchValue: string) => {
        if (!searchValue.trim()) {
            setFilteredDocuments(documents);
        } else {
            const filteredData = documents.filter(
                item =>
                    item.documentId?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    item.displayName?.toLowerCase().includes(searchValue.toLowerCase())
            );
            setFilteredDocuments(filteredData);
        }
        setError(false);
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleDocumentSelection = (document: MetadataSearchResponse) => {
        setError(false);

        const attachments = [...(formContext?.customData?.attachments || [])];
        const isAlreadySelected = attachments.some(attachment => attachment.documentId === document.documentId);

        if (!isAlreadySelected) {
            attachments.push({
                documentId: document?.documentId || '',
                docCategory: document?.documentCategory,
                documentType: document?.documentType,
                documentExt: document?.fileType,
                documentName: document?.displayName || '',
            });
            if (Array.isArray(attachments) && attachments.length >= 1 && uiSchema?.['ui:options']?.singleDocument == true) {
                formContext?.setCustomData && formContext.setCustomData({ attachments: attachments.slice(-1) });
            } else {
                formContext?.setCustomData && formContext.setCustomData({ attachments: attachments });
            }
        } else {
            setError(true);
        }
        setFilteredDocuments([]);
    };

    return (
        <>
            <div ref={inputRef} className={`${clsx(inputStyles.inputContainer, style.autoCompleteContainer)} `}>
                <Icon type={icon as IconType} className={inputStyles.icon} color="#676767" />
                <input
                    aria-labelledby="case-search-label"
                    placeholder={Placeholder || 'Find existing documents...'}
                    className={clsx(inputStyles.input, style.iconInput, style.linkDocumentInput)}
                    onChange={onChangeHandler}
                    key={id}
                    onFocus={onFocusHandler}
                    value={inputValue}
                    disabled={disabled}
                />
                {rawErrors &&
                    rawErrors.map(error => (
                        <AssistiveText key={error} text={error} variant={AssistiveTextVariant.Error} className="mt-2 max-w-[210px]" />
                    ))}
                {error && (
                    <AssistiveText text={t('documentSelectError')} variant={AssistiveTextVariant.Error} className="mt-2 max-w-[210px]" />
                )}
                <div className="max-h-[300px] overflow-y-auto ">
                    {filteredDocuments.map(document => (
                        <ClickContainer
                            ariaLabel={`different address`}
                            onClick={() => handleDocumentSelection(document)}
                            key={document.documentId}
                            classes={style.detailContainer}
                        >
                            <div className={style.card}>
                                <div className="icon">
                                    <Icon width={25} height={25} type={IconType.DOCUMENT_TEXT} />
                                </div>
                                <div className="text-content">
                                    <div className={style.title}>{document?.displayName || document?.documentId}</div>
                                    <div className={style.subTitle}>Document Id: {document?.documentId}</div>
                                </div>
                            </div>
                        </ClickContainer>
                    ))}
                </div>
                {fetchingDocuments == 'false' && documents.length == 0 && <div className="mt-2">{t('noDocumentFound')}</div>}
                {fetchingDocuments == 'true' && <div className="mt-2">{t('fetchingDocuments')}</div>}
            </div>
        </>
    );
}
