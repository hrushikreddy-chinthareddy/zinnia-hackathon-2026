import {
    Icon,
    IconType,
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

import TaxFormPreviewer from '@deps/components/document-viewer/tax-form-previewer';
import Popover from '@deps/components/popover/popover';
import { PopoverPlacement } from '@deps/components/tooltip/tooltip';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { TaxformResponse } from '@zinnia/api-types/types/documents-v3';

import styles from './documents-results-table.module.css';

type TaxDocumentsTableProps = {
    carrierCode: string;
    planCode?: string;
    policyNumber: string;
    results: TaxformResponse[];
};

export default function TaxDocumentsTable({
    carrierCode,
    planCode,
    policyNumber,
    results,
}: TaxDocumentsTableProps) {
    const { t } = useTranslation();

    return (
        <Table
            className="my-8"
            stickyColumn={TableStickyColumn.End}
            aria-describedby="tax-documents-table-description"
            role="table"
        >
            <caption id="tax-documents-table-description" className="sr-only">
                {t('allFields.tableCaptionsTaxDocuments') ?? ''}
            </caption>
            <TableHeader className="typography-content-body-sm-bold">
                <TableRow>
                    <TableHeaderCell>
                        {t('policy.documents.name')}
                    </TableHeaderCell>
                    <TableHeaderCell>
                        {t('policy.documents.taxYear')}
                    </TableHeaderCell>
                    <TableHeaderCell>
                        {t('policy.documents.formId')}
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <div className="flex flex-row items-center gap-1">
                            {t('policy.documents.actions')}
                            <Popover
                                body={t('policy.documents.actionsTooltip')}
                                title={t('policy.documents.actions') ?? ''}
                                placement={PopoverPlacement.TopLeft}
                            >
                                <Icon
                                    type={IconType.CIRCLE_INFO}
                                    color="var(--color-base-icon-action-text-link)"
                                    height={16}
                                    width={16}
                                />
                            </Popover>
                        </div>
                    </TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody
                className={clsx('typography-content-body-sm', styles.tableBody)}
            >
                {results.map((document) => {
                    return (
                        <TableRow
                            className="disabled-tr"
                            key={`document-${document.taxYear}-${document.formId}`}
                        >
                            <TableCell>
                                <span className="flex flex-col items-start">
                                    {document?.name || DEFAULT_ERROR_STRING}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span>
                                    {document?.taxYear || DEFAULT_ERROR_STRING}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span>
                                    {document.formId || DEFAULT_ERROR_STRING}
                                </span>
                            </TableCell>
                            <TableCell>
                                {' '}
                                <TaxFormPreviewer
                                    className="!underline-offset-2"
                                    carrier={carrierCode}
                                    planCode={planCode}
                                    policyNumber={policyNumber}
                                    taxForm={document}
                                >
                                    {t('policy.documents.view')}
                                </TaxFormPreviewer>
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
