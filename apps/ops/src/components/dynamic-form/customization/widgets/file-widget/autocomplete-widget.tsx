import { FormContextType, getUiOptions, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';
import { MetadataSearchResponse, SearchRequest } from '@zinnia/api-types/types/documents-v3';
import { IconType, Icon, AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { ChangeEvent, useEffect, useState } from 'react';

import ClickContainer from '@deps/components/click-container/click-container';
import inputStyles from '@deps/components/search/search-field-toggle/search-field-toggle.module.css';
import { searchDocumentsV3 } from '@deps/queries/api/client/documents/v3/search';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import style from './file-widget.module.css';
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
    const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const filteredData = documents.filter(item => item.documentId?.toLowerCase().includes(value?.toLowerCase()));
        setFilteredDocuments(filteredData);
        setInputValue('');
    };

    useEffect(() => {
        const fetchApiData = async (value: string) => {
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
            }
        };
        fetchApiData(value);
    }, []);

    const handleDocumentSelection = (document: MetadataSearchResponse) => {
        const attachments = [...formContext?.customData?.attachments];
        attachments.push({
            documentId: document?.documentId || '',
            docCategory: document?.documentCategory,
            documentType: document?.documentType,
            documentExt: document?.fileType,
            documentName: document?.displayName || '',
        });
        formContext?.setCustomData && formContext.setCustomData({ attachments: attachments });
        setFilteredDocuments([]);
    };

    return (
        <>
            <div className={`${clsx(inputStyles.inputContainer, style.autoCompleteContainer)} `}>
                <Icon type={icon as IconType} className={inputStyles.icon} color="#676767" />
                <input
                    aria-labelledby="case-search-label"
                    placeholder={Placeholder || 'Find existing documents...'}
                    className={clsx(inputStyles.input, style.iconInput, style.linkDocumentInput)}
                    onChange={onChangeHandler}
                    key={id}
                    value={inputValue}
                    disabled={disabled}
                />
                {rawErrors &&
                    rawErrors.map(error => (
                        <AssistiveText key={error} text={error} variant={AssistiveTextVariant.Error} className="mt-2 max-w-[210px]" />
                    ))}

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
        </>
    );
}
