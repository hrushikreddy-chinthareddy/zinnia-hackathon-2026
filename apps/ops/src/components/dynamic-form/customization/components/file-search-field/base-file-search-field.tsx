import {
    Icon,
    IconType,
    AssistiveText,
    AssistiveTextVariant,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

import ClickContainer from '@deps/components/click-container/click-container';
import inputStyles from '@deps/components/search/search-field/search-field.module.css';
import { useFileSearch } from '@deps/hooks/useFileSearch';
import { handleKeyDown } from '@deps/utils/events';
import { MetadataSearchResponse } from '@zinnia/api-types/types/documents-v3';

import { LinkedDocType } from './standalone-file-search-field';
import style from '../../widgets/file-widget/file-widget.module.css';

interface BaseFileSearchFieldProps {
    carrier?: string;
    caseId?: string;
    disabled?: boolean;
    readonly?: boolean;
    rawErrors?: string[];
    onSelect: (doc: MetadataSearchResponse) => void;
    linkedDocuments?: LinkedDocType[];
}

export const BaseFileSearchField = ({
    carrier,
    caseId,
    disabled,
    readonly,
    rawErrors,
    onSelect,
    linkedDocuments = [],
}: BaseFileSearchFieldProps) => {
    const {
        inputRef,
        inputValue,
        handleChange,
        handleFocus,
        fetchingDocuments,
        error,
        filteredDocuments,
    } = useFileSearch({ carrier, caseId, readonly, disabled });

    const { t } = useTranslation();

    return (
        <div
            ref={inputRef}
            className={clsx(
                inputStyles.inputContainer,
                style.autoCompleteContainer
            )}
        >
            <Icon type={IconType.SEARCH} className={inputStyles.icon} />

            <input
                placeholder={t('allFields.findExistingDocuments') ?? ''}
                className={clsx(
                    inputStyles.input,
                    style.iconInput,
                    style.linkDocumentInput
                )}
                onChange={handleChange}
                onFocus={handleFocus}
                value={inputValue}
                disabled={disabled}
                readOnly={readonly}
                onKeyDown={handleKeyDown}
            />

            {rawErrors?.map((e) => (
                <AssistiveText
                    key={e}
                    text={e}
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

            <div className={style.resultsContainer}>
                {filteredDocuments.map((doc) => {
                    const isLinked = linkedDocuments.some(
                        (item) => item.documentId === doc.documentId
                    );
                    return (
                        <ClickContainer
                            ariaLabel="Select document"
                            key={doc.documentId}
                            onClick={() => !isLinked && onSelect(doc)}
                            classes={clsx(style.detailContainer, {
                                'opacity-60 cursor-not-allowed': isLinked,
                            })}
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
                                        {doc.displayName || doc.documentId}
                                    </div>
                                    <div className={style.subTitle}>
                                        {isLinked
                                            ? t('allFields.alreadyLinked')
                                            : `ID: ${doc.documentId}`}
                                    </div>
                                </div>
                            </div>
                        </ClickContainer>
                    );
                })}
            </div>

            {fetchingDocuments && (
                <AssistiveText
                    text={t('fetchingDocuments')}
                    variant={AssistiveTextVariant.Info}
                    className="mt-2"
                />
            )}
        </div>
    );
};
