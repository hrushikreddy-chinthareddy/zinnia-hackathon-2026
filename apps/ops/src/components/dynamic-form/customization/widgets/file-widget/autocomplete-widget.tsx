import { getUiOptions, WidgetProps } from '@rjsf/utils';
import {
    MetadataSearchResponse,
    SearchRequest,
} from '@zinnia/api-types/types/documents-v3';
import {
    IconType,
    Icon,
    AssistiveText,
    AssistiveTextVariant,
} from '@zinnia/bloom/components';
import { HttpStatusCode } from 'axios';
import clsx from 'clsx';
import { ChangeEvent, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import ClickContainer from '@deps/components/click-container/click-container';
import inputStyles from '@deps/components/search/search-field/search-field.module.css';
import { parseJsonValue } from '@deps/helpers/csr-api-helpers';
import { replacePlaceholders } from '@deps/helpers/value-placement.helpers';
import { getDocumentSearchResultsQuery } from '@deps/queries/tanstack/documentQueries/document-queries';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';
import { attachFilesToMappedDocuments } from '@deps/utils/tasks/task-payload-helpers';

import style from './file-widget.module.css';
import { FileInfoComponent } from '../../templates/object-field-template/file-info-template';

export default function AutoCompleteWidget(props: WidgetProps) {
    const {
        id,
        disabled,
        readonly,
        rawErrors,
        uiSchema,
        value,
        formContext,
        Placeholder,
        multiple,
        onChange,
        schema: { type },
    } = props;

    const { icon, displayAttachments } = getUiOptions(uiSchema);

    const [documents, setDocuments] = useState<MetadataSearchResponse[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<
        MetadataSearchResponse[]
    >([]);
    const [inputValue, setInputValue] = useState<string>('');
    const inputRef = useRef<HTMLDivElement>(null);
    const [fetchingDocuments, setFetchingDocuments] = useState<boolean | null>(
        null
    );
    const [error, setError] = useState<boolean>(false);
    const { t } = useTranslation(undefined, {
        keyPrefix: 'taskManagementQueue',
    });
    const caseKey = uiSchema?.['ui:options']?.['default'];
    const extractedCaseId = caseKey
        ? replacePlaceholders(caseKey, formContext?.customData)
        : '';

    const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        const value = event.target.value;
        filterDocuments(value);
        setInputValue(value);
    };

    useEffect(() => {
        const fetchApiData = async () => {
            setFetchingDocuments(true);
            const searchBody: SearchRequest = {
                documentClassification:
                    SearchRequest.documentClassification.INBOUND,
                zinniaLiveCaseId:
                    extractedCaseId || formContext?.customData?.caseId,
                parentCarrierCode: formContext?.customData?.carrier,
            };
            try {
                const { data, status } = await getDocumentSearchResultsQuery(
                    searchBody,
                    25,
                    0,
                    true
                );
                if (data) {
                    setDocuments(data as MetadataSearchResponse[]);
                } else if (status !== HttpStatusCode.Ok) {
                    browserLogError(
                        'fetchLinkedDocuments::Error fetching linked documents',
                        {
                            ...parseErrorInformation(error),
                            caseId: formContext?.customData?.caseId,
                            carrier: formContext?.customData?.carrier,
                            fileName: 'autocomplete-widget-fetchApiData',
                        }
                    );
                }
            } catch (err) {
                browserLogError(
                    'fetchLinkedDocuments::Unexpected error occurred',
                    {
                        ...parseErrorInformation(err),
                        caseId: formContext?.caseId,
                        carrier: formContext?.carrier,
                        fileName: 'autocomplete-widget::fetchApiData',
                    }
                );
            } finally {
                setFetchingDocuments(false);
            }
        };
        fetchApiData();
    }, []);

    const onFocusHandler = () => {
        if (readonly) {
            return;
        }
        filterDocuments(inputValue ?? '');
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (
            inputRef.current &&
            !inputRef.current.contains(event.target as Node)
        ) {
            setFilteredDocuments([]);
        }
    };

    const filterDocuments = (searchValue: string) => {
        if (!searchValue.trim()) {
            setFilteredDocuments(documents);
        } else {
            const filteredData = documents.filter(
                (item) =>
                    item.documentId
                        ?.toLowerCase()
                        .includes(searchValue.toLowerCase()) ||
                    item.displayName
                        ?.toLowerCase()
                        .includes(searchValue.toLowerCase())
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

    const handleDocumentSelection = async (
        document: MetadataSearchResponse
    ) => {
        setError(false);

        const attachments = displayAttachments
            ? value
            : [...(formContext?.customData?.attachments || [])];

        const attachment = {
            documentId: document?.documentId || '',
            docCategory: document?.documentCategory,
            documentType: document?.documentType,
            documentExt: document?.fileType,
            documentName: document?.displayName || '',
        };

        if (displayAttachments) {
            if (type === 'string') {
                onChange(JSON.stringify(attachment));
            } else {
                onChange(JSON.stringify(attachments));
            }
            setFilteredDocuments([]);
        } else {
            const isAlreadySelected = attachments.some(
                (attachment: MetadataSearchResponse) =>
                    attachment.documentId === document.documentId
            );

            if (!isAlreadySelected) {
                attachments.push(attachment);

                formContext?.setCustomData &&
                    formContext.setCustomData({ attachments: attachments });

                const task = formContext?.customData?.task;
                setFilteredDocuments([]);
                return await attachFilesToMappedDocuments(
                    attachment,
                    task,
                    formContext?.correlationId || ''
                );
            } else {
                setError(true);
                setFilteredDocuments([]);
            }
        }
    };

    const readonlyClass = readonly ? '!cursor-not-allowed opacity-50' : '';

    return (
        <>
            <div
                ref={inputRef}
                className={`${clsx(
                    inputStyles.inputContainer,
                    style.autoCompleteContainer
                )} `}
            >
                <Icon
                    type={icon as IconType}
                    className={inputStyles.icon}
                    color="#676767"
                />
                <input
                    aria-labelledby="case-search-label"
                    placeholder={Placeholder || 'Find existing documents...'}
                    className={`${clsx(
                        inputStyles.input,
                        style.iconInput,
                        style.linkDocumentInput
                    )} ${readonlyClass}`}
                    onChange={onChangeHandler}
                    key={id}
                    onFocus={onFocusHandler}
                    value={inputValue}
                    disabled={disabled || readonly}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                        }
                    }}
                />
                {rawErrors &&
                    rawErrors.map((error) => (
                        <AssistiveText
                            key={error}
                            text={error}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2 max-w-[210px]"
                        />
                    ))}
                {error && (
                    <AssistiveText
                        text={t('documentSelectError')}
                        variant={AssistiveTextVariant.Error}
                        className="mt-2 max-w-[210px]"
                    />
                )}
                <div className="max-h-[300px] overflow-y-auto ">
                    {filteredDocuments.map((document) => (
                        <ClickContainer
                            ariaLabel={`different address`}
                            onClick={() => handleDocumentSelection(document)}
                            key={document.documentId}
                            classes={style.detailContainer}
                        >
                            <div className={style.card}>
                                <div className="icon">
                                    <Icon
                                        width={25}
                                        height={25}
                                        type={IconType.DOCUMENT_TEXT}
                                    />
                                </div>
                                <div className="text-content">
                                    <div className={style.title}>
                                        {document?.displayName ||
                                            document?.documentId}
                                    </div>
                                    <div className={style.subTitle}>
                                        Document Id: {document?.documentId}
                                    </div>
                                </div>
                            </div>
                        </ClickContainer>
                    ))}
                </div>
                {fetchingDocuments == false && documents.length == 0 && (
                    <div className="mt-2">{t('noDocumentFound')}</div>
                )}
                {fetchingDocuments == true && (
                    <div className="mt-2">{t('fetchingDocuments')}</div>
                )}
            </div>
            {value && displayAttachments && type === 'string' && (
                <FileInfoComponent
                    files={[parseJsonValue(value)]}
                    readonly={readonly || false}
                    formContext={props.formContext}
                    showDelete={false}
                />
            )}
        </>
    );
}
