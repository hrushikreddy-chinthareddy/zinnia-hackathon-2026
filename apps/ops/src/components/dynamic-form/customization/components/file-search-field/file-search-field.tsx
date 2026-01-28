import { WidgetProps } from '@rjsf/utils';
import { useQuery } from '@tanstack/react-query';
import {
    IconType,
    Icon,
    AssistiveText,
    AssistiveTextVariant,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useState, ChangeEvent, useEffect, useRef } from 'react';

import ClickContainer from '@deps/components/click-container/click-container';
import inputStyles from '@deps/components/search/search-field/search-field.module.css';
import { replacePlaceholders } from '@deps/helpers/value-placement.helpers';
import { ActionTypes } from '@deps/models/case/task';
import { TaskDocument } from '@deps/models/case/task-instance';
import { getDocumentSearchResultsQuery } from '@deps/queries/tanstack/documentQueries/document-queries';
import { handleKeyDown } from '@deps/utils/events';
import {
    SearchRequest,
    MetadataSearchResponse,
} from '@zinnia/api-types/types/documents-v3';

import { FileAttachmentProps } from '../../widgets/file-widget/file-widget';
import style from '../../widgets/file-widget/file-widget.module.css';

export const FileSearchField = ({
    attachments = [],
    setAttachments,
    widgetProps = {} as WidgetProps,
}: FileAttachmentProps) => {
    const {
        id,
        disabled,
        rawErrors,
        uiSchema,
        formContext,
        Placeholder,
        readonly,
    } = widgetProps;
    const limit = 25;
    const offset = 0;

    const [filteredDocuments, setFilteredDocuments] = useState<
        MetadataSearchResponse[]
    >([]);
    const [inputValue, setInputValue] = useState<string>('');
    const inputRef = useRef<HTMLDivElement>(null);

    const [error, setError] = useState<boolean>(false);
    const { t } = useTranslation(undefined, {
        keyPrefix: 'taskManagementQueue',
    });
    const caseKey = uiSchema?.['ui:options']?.['default'];
    const extractedCaseId = caseKey
        ? replacePlaceholders(caseKey, formContext?.customData)
        : '';
    const extractedCarrier = formContext?.customData?.carrier;
    const caseId = extractedCaseId || formContext?.customData?.caseId;

    const searchParams: SearchRequest = {
        documentClassification: SearchRequest.documentClassification.INBOUND,
        zinniaLiveCaseId: caseId,
        parentCarrierCode: extractedCarrier,
    };

    const { data: documents = [], isLoading } = useQuery({
        queryKey: ['documentSearch', searchParams, limit, offset],
        queryFn: () =>
            getDocumentSearchResultsQuery(searchParams, limit, offset),
        enabled: !!caseId && !!extractedCarrier,
        select: (data) => (data.data || []) as MetadataSearchResponse[],
    });

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
        const displayName =
            'displayName' in document
                ? document.displayName
                : (document as TaskDocument).documentName;

        const attachment = {
            documentId: document?.documentId || '',
            docCategory: document?.documentCategory || '',
            documentType: document?.documentType || '',
            documentExt: document?.fileType || '',
            documentName: displayName || '',
        };

        const isAlreadySelected = attachments?.some(
            (attachment) => attachment.documentId === document.documentId
        );

        if (!isAlreadySelected) {
            setAttachments(attachment, ActionTypes.Add);
        }
        setFilteredDocuments([]);
    };

    const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        const value = event.target.value;
        filterDocuments(value);
        setInputValue(value);
    };

    return (
        <div
            ref={inputRef}
            className={`${clsx(
                inputStyles.inputContainer,
                style.autoCompleteContainer
            )} `}
        >
            <Icon type={IconType.SEARCH} className={inputStyles.icon} />
            <input
                aria-labelledby="case-search-label"
                placeholder={Placeholder || 'Find existing documents...'}
                className={clsx(
                    inputStyles.input,
                    style.iconInput,
                    style.linkDocumentInput
                )}
                onChange={onChangeHandler}
                key={id}
                onFocus={onFocusHandler}
                value={inputValue}
                disabled={disabled}
                readOnly={readonly}
                onKeyDown={handleKeyDown}
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
                {filteredDocuments.map((document, index) => (
                    <ClickContainer
                        ariaLabel={`different address`}
                        onClick={() => handleDocumentSelection(document)}
                        key={`${index}-${document.documentId}`}
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
            {!isLoading && !documents.length && (
                <AssistiveText
                    text={t('noDocumentFound')}
                    variant={AssistiveTextVariant.Error}
                    className="mt-2"
                />
            )}
            {isLoading && (
                <AssistiveText
                    text={t('fetchingDocuments')}
                    variant={AssistiveTextVariant.Info}
                    className="mt-2"
                />
            )}
        </div>
    );
};
