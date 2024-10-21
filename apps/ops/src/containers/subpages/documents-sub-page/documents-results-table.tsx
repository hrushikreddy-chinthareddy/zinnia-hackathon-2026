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
import Image from 'next/image';
import { TFunction, useTranslation } from 'next-i18next';

import DocumentPreviewer from '@deps/components/document-viewer/document-previewer';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Popover from '@deps/components/popover/popover';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/documents-content';
import Tooltip, { PopoverPlacement } from '@deps/components/tooltip/tooltip';
import { isPreviewSupported, useDocumentDownload } from '@deps/helpers/documents.helper';
import { convertKebabedDateString } from '@deps/helpers/string.helper';
import { ReactComponent as LinkIcon } from '@deps/styles/elements/icons/actions/link.svg';
import loadingImage from '@deps/styles/images/loader.png';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import styles from './documents-results-table.module.css';
import { DocumentWithSource } from './documents-sub-page';

type DocumentsResultsTableProps = {
    carrierCode: string;
    documentType: DocumentTypeView;
    linkedDocumentIdentifiers?: string[];
    policyNumber: string;
    results: DocumentWithSource[];
};

const DownloadItem = ({ doc, carrierCode }: { doc: DocumentWithSource; carrierCode: string }) => {
    const { t } = useTranslation();
    const [loading, download] = useDocumentDownload(
        doc.documentId || (doc.documentID as string),
        doc.documentSource,
        carrierCode,
        doc.displayName
    );

    return (
        <NavElement
            className="text-left underline underline-offset-2"
            onClick={download}
            size={NavElementSize.Small}
            title={`${t('general.download')} ${doc.displayName}`}
            type={NavElementType.Button}
            variant={NavElementVariant.Secondary}
        >
            {loading ? (
                <Image
                    alt={t('general.downloading')}
                    className="transform-origin-center duration-2000 animate-spin ease-linear"
                    height={20}
                    src={loadingImage}
                    width={20}
                />
            ) : (
                t('policy.documents.download')
            )}
        </NavElement>
    );
};

export const createAction = (doc: DocumentWithSource, carrierCode: string, t: TFunction, label?:string) => {
    return isPreviewSupported(doc) ? (
        <DocumentPreviewer
            className="!underline-offset-2"
            carrier={carrierCode}
            document={doc}
            activeDocType={doc.documentSource}
            variant={NavElementVariant.Secondary}
        >
             {label ? t(label) :t('view')}
        </DocumentPreviewer>
    ) : (
        <DownloadItem doc={doc} carrierCode={carrierCode} />
    );
};

export default function DocumentsResultsTable({
    carrierCode,
    documentType,
    linkedDocumentIdentifiers = [],
    policyNumber,
    results,
}: DocumentsResultsTableProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'policy.documents' });

    return (
        <Table className="my-8" stickyColumn={TableStickyColumn.End}>
            <caption className="hidden">{`${policyNumber} ${t('documents')}`}</caption>
            <TableHeader className="typography-content-body-sm-bold">
                <TableRow>
                    <TableHeaderCell>
                        <div className="flex flex-row items-center gap-1">
                            {t('documentIdentifier')}
                            <Popover
                                body={t('documentIdentifierTooltip')}
                                title={t('documentIdentifier') as string}
                                placement={PopoverPlacement.TopRight}
                            >
                                <Icon type={IconType.CIRCLE_INFO} color="var(--color-primary-color-primary)" height={16} width={16} />
                            </Popover>
                        </div>
                    </TableHeaderCell>
                    <TableHeaderCell>{t('document')}</TableHeaderCell>
                    <TableHeaderCell>{t(documentType === DocumentTypeView.Correspondence ? 'sentDate' : 'receivedDate')}</TableHeaderCell>
                    <TableHeaderCell>{t('fileType')}</TableHeaderCell>
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
                    const docDisplayId = document.documentNumber || document.documentId || (document.documentID as string);
                    return (
                        <TableRow className="disabled-tr" key={`document-${document.documentId || document.documentID}`}>
                            <TableCell>
                                {linkedDocumentIdentifiers.includes(docDisplayId) ? (
                                    <Tooltip
                                        body={
                                            t('linkedTo', {
                                                type: document.documentType?.toLowerCase() || DEFAULT_ERROR_STRING,
                                            }) as string
                                        }
                                        placement={PopoverPlacement.TopRight}
                                    >
                                        <LinkIcon className="-mt-0.5 mr-1.5 inline text-gray-600" width={16} height={16} />
                                    </Tooltip>
                                ) : null}
                                {docDisplayId}
                            </TableCell>
                            <TableCell>
                                <Tooltip body={document.displayName} placement={PopoverPlacement.TopRight}>
                                    <PiiWrapper>{document.displayName}</PiiWrapper>
                                </Tooltip>
                            </TableCell>
                            <TableCell>
                                <span>{convertKebabedDateString(document.documentDate)}</span>
                            </TableCell>
                            <TableCell>
                                <span>{document.fileType}</span>
                            </TableCell>
                            <TableCell>{createAction(document, carrierCode, t)}</TableCell>
                        </TableRow>
                    );
                })}
                {!results.length && (
                    <TableRow className="disabled-tr w-full">
                        <TableCell className="!text-left md:!text-center" colSpan={5}>
                            {t('noResults')}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
