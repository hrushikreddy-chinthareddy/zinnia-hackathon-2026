import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableStickyColumn,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';

import { createViewDownloadAction } from './documents-results-table';
import styles from './documents-results-table.module.css';

type IllustrationDocumentsTableProps = {
    carrierCode: string;
    results: any; // TODO: fix type
};

export default function IllustrationDocumentsTable({
    carrierCode,
    results,
}: IllustrationDocumentsTableProps) {
    const { t } = useTranslation();
    return (
        <Table
            className="my-8"
            stickyColumn={TableStickyColumn.End}
            aria-describedby="illustration-documents-table-description"
            role="table"
        >
            <caption
                id="illustration-documents-table-description"
                className="sr-only"
            >
                {t('allFields.tableCaptionsIllustrationDocuments') ?? ''}
            </caption>
            <TableHeader className="typography-content-body-sm-bold">
                <TableRow>
                    <TableHeaderCell>
                        {t('policy.documents.name')}
                    </TableHeaderCell>
                    <TableHeaderCell>
                        {t('policy.documents.created')}
                    </TableHeaderCell>
                    <TableHeaderCell>
                        {t('policy.documents.createdBy')}
                    </TableHeaderCell>
                    <TableHeaderCell>
                        {t('policy.documents.actions')}
                    </TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody
                className={clsx('typography-content-body-sm', styles.tableBody)}
            >
                {results.map((document: any) => {
                    return (
                        <TableRow key={`document-${document.documentId}`}>
                            <TableCell>
                                <span className="flex flex-col items-start">
                                    {document.name || DEFAULT_ERROR_STRING}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span>
                                    {document.created || DEFAULT_ERROR_STRING}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span>
                                    {document.createdBy || DEFAULT_ERROR_STRING}
                                </span>
                            </TableCell>
                            <TableCell>
                                {createViewDownloadAction(
                                    document,
                                    carrierCode,
                                    t,
                                    'policy.documents.view'
                                )}
                            </TableCell>
                        </TableRow>
                    );
                })}
                {!results.length && (
                    <TableRow className="disabled-tr w-full">
                        <TableCell
                            className={clsx(
                                '!text-left md:!text-center',
                                styles.noResults
                            )}
                            colSpan={5}
                        >
                            {t('policy.documents.noResults')}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
