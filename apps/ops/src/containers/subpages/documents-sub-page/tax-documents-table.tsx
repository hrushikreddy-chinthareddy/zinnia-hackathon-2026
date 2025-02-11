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

import { NavElementVariant } from '@deps/components/nav-element/nav-element';
import Popover from '@deps/components/popover/popover';
import { PopoverPlacement } from '@deps/components/tooltip/tooltip';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import TaxFormPreviewer from '@deps/components/document-viewer/tax-form-previewer';

import styles from './documents-results-table.module.css';
import { TaxformResponse } from '@zinnia/api-types/types/documents-v3';

type TaxDocumentsTableProps = {
    carrierCode: string;
    policyNumber: string;
    results: TaxformResponse[];
};

export default function TaxDocumentsTable({ carrierCode, policyNumber, results }: TaxDocumentsTableProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'policy.documents' });

    return (
        <Table className="my-8" stickyColumn={TableStickyColumn.End}>
            <caption className="hidden">{`${policyNumber} ${t('documents')}`}</caption>
            <TableHeader className="typography-content-body-sm-bold">
                <TableRow>
                    <TableHeaderCell>{t('name')}</TableHeaderCell>
                    <TableHeaderCell>{t('taxYear')}</TableHeaderCell>
                    <TableHeaderCell>{t('formId')}</TableHeaderCell>
                    <TableHeaderCell>
                        <div className="flex flex-row items-center gap-1">
                            {t('actions')}
                            <Popover body={t('actionsTooltip')} title={t('actions') as string} placement={PopoverPlacement.TopLeft}>
                                <Icon type={IconType.CIRCLE_INFO} color="var(--color-primary-color-primary)" height={16} width={16} />
                            </Popover>
                        </div>
                    </TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody className={clsx('typography-content-body-sm', styles.tableBody)}>
                {results.map(document => {
                    return (
                        <TableRow className="disabled-tr" key={`document-${document.taxYear}-${document.formId}`}>
                            <TableCell>
                                <span className="flex flex-col items-start">{document?.name || DEFAULT_ERROR_STRING}</span>
                            </TableCell>
                            <TableCell>
                                <span>{document?.taxYear || DEFAULT_ERROR_STRING}</span>
                            </TableCell>
                            <TableCell>
                                <span>{document.formId || DEFAULT_ERROR_STRING}</span>
                            </TableCell>
                            <TableCell>
                                {' '}
                                <TaxFormPreviewer
                                    className="!underline-offset-2"
                                    carrier={carrierCode}
                                    policyNumber={policyNumber}
                                    taxForm={document}
                                    variant={NavElementVariant.Secondary}
                                >
                                    {t('view')}
                                </TaxFormPreviewer>
                            </TableCell>
                        </TableRow>
                    );
                })}
                {!results.length && (
                    <TableRow className="disabled-tr w-full">
                        <TableCell className={clsx('!text-left md:!text-center', styles.noResults)} colSpan={5}>
                            {t('noResults')}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
