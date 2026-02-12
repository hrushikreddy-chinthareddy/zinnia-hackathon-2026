import {
    Divider,
    Icon,
    IconType,
    Loader,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableStickyColumn,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';

import Field from '@deps/components/fields/field';
import PaginationControls from '@deps/components/pagination/pagination';
import SelectComponent from '@deps/components/select/select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useKnowledgeBaseContext } from '@deps/contexts/KnowledgeBaseContext';
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import {
    getDocumentsByClientId,
    searchDocuments,
} from '@deps/queries/api/knowledge-base';
import {
    DocumentsDisplayType,
    KeyboardEvents,
    SortDirection,
    SortFields,
} from '@deps/types/knowledge-base';
import { browserLogError } from '@deps/utils/browser-logging';
import { formatDateTime } from '@deps/utils/dates';
import { ClientDocumentDto } from '@zinnia/api-types/types/knowledgebase';

import CommonHeader from '../../common-header/common-header';
import DocumentPreview from '../document-preview/document-preview';

type DocumentsPageProps = {
    docs: DocumentsDisplayType;
};

type SortConfig = {
    key: SortFields;
    direction: SortDirection;
};

const DocumentsPage = ({ docs }: DocumentsPageProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant',
    });
    const { selectedClientId } = useKnowledgeBaseContext();
    const [documents, setDocuments] = useState<ClientDocumentDto[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<
        ClientDocumentDto[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [searchPage, setSearchPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [searchTotal, setSearchTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

    const MIN_SEARCH_TERM_LENGTH = 3;

    const sidesheet = useSideSheetContextLegacy();

    const pageSizeOptions = [
        {
            value: '10',
            textValue: '10',
            label: '10',
        },
        {
            value: '20',
            textValue: '20',
            label: '20',
        },
        {
            value: '50',
            textValue: '50',
            label: '50',
        },
    ];

    const handlePageSizeChange = (size: string) => {
        setPageSize(parseInt(size));
        if (searchTerm.trim().length >= MIN_SEARCH_TERM_LENGTH) {
            setSearchPage(0);
            handleSearchDocuments(searchTerm, 0, parseInt(size));
        } else {
            setPage(0);
            fetchDocuments(0, parseInt(size));
        }
    };

    const getPageTitle = () => {
        switch (docs) {
            case DocumentsDisplayType.All:
                return t('documents.allDocs');
            case DocumentsDisplayType.Recent:
                return t('documents.recentlyAdded');
            case DocumentsDisplayType.Updated:
                return t('documents.recentlyModified');
        }
    };
    const fetchDocuments = useCallback(
        async (page: number, pageSize = 10) => {
            if (!selectedClientId) return;
            try {
                setLoading(true);
                const response = await getDocumentsByClientId(
                    selectedClientId,
                    docs,
                    docs === DocumentsDisplayType.All ? page : undefined,
                    docs === DocumentsDisplayType.All ? pageSize : undefined
                );
                if (!response) {
                    setDocuments([]);
                    setTotal(0);
                    return;
                }
                if (docs === DocumentsDisplayType.All) {
                    setDocuments(response.content || []);
                    setTotal(response.totalElements || 0);
                } else {
                    setDocuments(response || []);
                    setTotal(response.length);
                }
            } catch (error) {
                browserLogError('Error fetching documents::', { error });
                setDocuments([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        },
        [selectedClientId, docs]
    );

    const handleGoToPage = useCallback(
        (offset: number) => {
            const page = offset - 1;
            setPage(page);
            fetchDocuments(page, pageSize);
        },
        [fetchDocuments, pageSize]
    );

    const handleSearchPageChange = (offset: number) => {
        const newPage = offset - 1;
        setSearchPage(newPage);
        handleSearchDocuments(searchTerm, newPage, pageSize);
    };

    const handleSearchDocuments = useCallback(
        async (term: string, pageOffset = 0, pageSize = 10) => {
            if (!selectedClientId) return;
            try {
                setLoading(true);
                const response = await searchDocuments(
                    selectedClientId,
                    term,
                    pageOffset,
                    pageSize
                );
                setFilteredDocuments(response?.content || []);
                setSearchTotal(response?.totalElements || 0);
            } catch (error) {
                browserLogError('Error searching documents::', { error });
                setFilteredDocuments([]);
                setSearchTotal(0);
            } finally {
                setLoading(false);
            }
        },
        [selectedClientId]
    );

    const toggleSortConfig = (key: SortFields) => {
        setSortConfig((prev) => {
            if (prev?.key === key) {
                return {
                    key,
                    direction:
                        prev.direction === SortDirection.Asc
                            ? SortDirection.Desc
                            : SortDirection.Asc,
                } as SortConfig;
            } else {
                return { key, direction: SortDirection.Asc } as SortConfig;
            }
        });
    };

    const handleSortDocuments = useCallback(() => {
        if (!sortConfig) return;
        const { key, direction } = sortConfig;

        const sortFn = (a: ClientDocumentDto, b: ClientDocumentDto) => {
            let aValue: string | Date = '';
            let bValue: string | Date = '';

            switch (key) {
                case SortFields.Name:
                    aValue = a?.name?.toLowerCase() || '';
                    bValue = b?.name?.toLowerCase() || '';
                    break;
                case SortFields.Created:
                    aValue = new Date(a.createdAt || '');
                    bValue = new Date(b.createdAt || '');
                    break;
                case SortFields.Updated:
                    aValue = new Date(a.updatedAt || '');
                    bValue = new Date(b.updatedAt || '');
                    break;
            }

            if (aValue < bValue)
                return direction === SortDirection.Asc ? -1 : 1;
            if (aValue > bValue)
                return direction === SortDirection.Asc ? 1 : -1;
            return 0;
        };

        if (searchTerm.trim().length >= MIN_SEARCH_TERM_LENGTH) {
            setFilteredDocuments((prev) => [...prev].sort(sortFn));
        } else {
            setDocuments((prev) => [...prev].sort(sortFn));
        }
    }, [sortConfig, searchTerm]);

    const renderSortIcon = () => {
        return (
            <span className="text-gray-500">
                {sortConfig?.direction === SortDirection.Desc ? (
                    <Icon type={IconType.ARROW_DOWN} />
                ) : (
                    <Icon type={IconType.ARROW_UP} />
                )}
            </span>
        );
    };

    const handleOpenDocumentPreview = ({
        name,
        webUrl,
        createdAt,
        updatedAt,
        itemId,
        driveId,
    }: ClientDocumentDto) => {
        const newDocment = {
            name,
            webUrl,
            createdAt,
            updatedAt,
            itemId,
            driveId,
        };
        sidesheet.changeSideSheetContent(
            t('documents.docPreview'),
            <DocumentPreview document={newDocment} />,
            true
        );
        sidesheet.handleOpen(true, 1380);
    };

    const renderDocuments = (
        docsToRender: ClientDocumentDto[],
        totalCount: number,
        paginated: boolean,
        onPageChange: (page: number) => void,
        currentPage: number
    ) => (
        <div className="mt-6">
            {docsToRender.length > 0 ? (
                <>
                    <Table
                        stickyColumn={TableStickyColumn.End}
                        className="h-[52vh]"
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell
                                    className="typography-content-body-sm-bold"
                                    onClick={() =>
                                        toggleSortConfig(SortFields.Name)
                                    }
                                    sortable={true}
                                >
                                    {t('documents.fileName')}
                                    {sortConfig?.key === SortFields.Name &&
                                        renderSortIcon()}
                                </TableHeaderCell>
                                <TableHeaderCell
                                    className="typography-content-body-sm-bold"
                                    onClick={() =>
                                        toggleSortConfig(SortFields.Updated)
                                    }
                                    sortable={true}
                                >
                                    {t('documents.updatedAt')}
                                    {sortConfig?.key === SortFields.Updated &&
                                        renderSortIcon()}
                                </TableHeaderCell>
                                <TableHeaderCell
                                    className="typography-content-body-sm-bold"
                                    onClick={() =>
                                        toggleSortConfig(SortFields.Created)
                                    }
                                    sortable={true}
                                >
                                    {t('documents.createdAt')}
                                    {sortConfig?.key === SortFields.Created &&
                                        renderSortIcon()}
                                </TableHeaderCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {docsToRender.map(
                                ({
                                    name,
                                    webUrl,
                                    createdAt,
                                    updatedAt,
                                    itemId,
                                    driveId,
                                }) => (
                                    <TableRow key={webUrl}>
                                        <TableCell
                                            tabIndex={0}
                                            data-testid="document-name"
                                            className="typography-content-body-sm text-[--color-base-text-link] cursor-pointer"
                                            onClick={() => {
                                                handleOpenDocumentPreview({
                                                    name,
                                                    webUrl,
                                                    createdAt,
                                                    updatedAt,
                                                    itemId,
                                                    driveId,
                                                });
                                            }}
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key ===
                                                        KeyboardEvents.Enter ||
                                                    e.key ===
                                                        KeyboardEvents.Space
                                                ) {
                                                    e.preventDefault();
                                                    handleOpenDocumentPreview({
                                                        name,
                                                        webUrl,
                                                        createdAt,
                                                        updatedAt,
                                                        itemId,
                                                        driveId,
                                                    });
                                                }
                                            }}
                                        >
                                            {name}
                                        </TableCell>
                                        <TableCell
                                            data-testid="document-updated"
                                            className="typography-content-body-sm"
                                        >
                                            {formatDateTime(updatedAt || '')}
                                        </TableCell>
                                        <TableCell
                                            data-testid="document-created"
                                            className="typography-content-body-sm"
                                        >
                                            {formatDateTime(createdAt || '')}
                                        </TableCell>
                                    </TableRow>
                                )
                            )}
                        </TableBody>
                    </Table>

                    {paginated && totalCount > pageSize && (
                        <div className="pt-4 flex gap-8 items-end justify-center">
                            {docs === DocumentsDisplayType.All && (
                                <div className="flex flex-col gap-1">
                                    <SelectComponent
                                        label={
                                            t('documents.resultsPerPage') || ''
                                        }
                                        value={pageSize.toString()}
                                        options={pageSizeOptions}
                                        onChange={handlePageSizeChange}
                                    />
                                </div>
                            )}
                            <PaginationControls
                                limit={pageSize}
                                offset={currentPage * pageSize}
                                total={totalCount}
                                goToPage={onPageChange}
                            />
                        </div>
                    )}
                </>
            ) : (
                <Typography
                    variant={TypographyVariant.H4}
                    className="text-gray-500"
                >
                    {t('documents.noDoc')}
                </Typography>
            )}
        </div>
    );

    const resetData = () => {
        setPage(0);
        setSearchPage(0);
        setSearchTerm('');
        setFilteredDocuments([]);
        setSearchTotal(0);
    };

    useEffect(() => {
        if (selectedClientId) {
            resetData();
            fetchDocuments(0);
            setPageSize(10);
        }
    }, [selectedClientId, docs, fetchDocuments]);

    useEffect(() => {
        handleSortDocuments();
    }, [sortConfig, handleSortDocuments]);

    return (
        <div className="px-6 h-full flex flex-col gap-8">
            <CommonHeader />
            <div>
                <Typography variant={TypographyVariant.H2} className="mb-4">
                    {getPageTitle()}
                </Typography>

                <Divider direction="horizontal" color="default" />

                {docs === DocumentsDisplayType.All && (
                    <div className="flex justify-end mt-6">
                        <Field
                            placeholder={t('documents.search') || ''}
                            value={searchTerm}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const term = e.target.value;
                                setSearchTerm(term);
                                setSearchPage(0);
                                if (
                                    term.trim().length >= MIN_SEARCH_TERM_LENGTH
                                ) {
                                    handleSearchDocuments(term, 0, pageSize);
                                } else {
                                    setFilteredDocuments([]);
                                    setSearchTotal(0);
                                }
                            }}
                            startIcon={
                                <Icon type={IconType.SEARCH} className="mr-1" />
                            }
                            className="py-1"
                            onClear={() => {
                                setSearchTerm('');
                                setSearchPage(0);
                                setFilteredDocuments([]);
                                setSearchTotal(0);
                                fetchDocuments(0, pageSize);
                            }}
                            isClearable
                        />
                    </div>
                )}

                <div>
                    {loading ? (
                        <div className="mt-6 text-center mx-auto">
                            <Loader />
                        </div>
                    ) : searchTerm.trim().length >= MIN_SEARCH_TERM_LENGTH ? (
                        renderDocuments(
                            filteredDocuments,
                            searchTotal,
                            true,
                            handleSearchPageChange,
                            searchPage
                        )
                    ) : (
                        renderDocuments(
                            documents,
                            total,
                            docs === DocumentsDisplayType.All,
                            handleGoToPage,
                            page
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentsPage;
