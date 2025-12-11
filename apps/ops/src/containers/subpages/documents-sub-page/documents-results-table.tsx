import {
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
import clsx from 'clsx';
import { TFunction, useTranslation } from 'next-i18next';
import { v4 as uuidV4 } from 'uuid';

import DocumentPreviewer from '@deps/components/document-viewer/document-previewer';
import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Popover from '@deps/components/popover/popover';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import Tooltip, { PopoverPlacement } from '@deps/components/tooltip/tooltip';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import {
    isPreviewSupported,
    useDocumentDownload,
} from '@deps/hooks/useDocumentDownload';
import { ReactComponent as LinkIcon } from '@deps/styles/elements/icons/actions/link.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { V3DocumentWithSource } from '@deps/types/documents-v3';
import {
    CaseDocumentClickedEvent,
    SegmentTrackedEventName,
} from '@deps/types/segment-analytics';
import { MetadataSearchResponse } from '@zinnia/api-types/types/documents-v3';

import styles from './documents-results-table.module.css';
import { DocumentWithSource } from './documents-sub-page';

type DocumentsResultsTableProps = {
    carrierCode: string;
    documentType: DocumentTypeView;
    linkedDocumentIdentifiers?: string[];
    policyNumber: string;
    results: DocumentWithSource[] | V3DocumentWithSource[];
    planCode: string | undefined;
    policyDeliveryDate: string | undefined;
};

const DownloadItem = ({
    doc,
    carrierCode,
}: {
    doc: DocumentWithSource | MetadataSearchResponse;
    carrierCode: string;
}) => {
    const { t } = useTranslation();
    const docId =
        doc.documentId || ((doc as DocumentWithSource).documentID as string);
    const { sessionId, partyId } = usePermissionsContext();
    const [loading, download] = useDocumentDownload(
        docId,
        (doc as DocumentWithSource).documentSource ||
            (doc as MetadataSearchResponse).documentClassification,
        carrierCode,
        doc.displayName || docId,
        doc.fileType
    );

    const downloadDocument = () => {
        download();

        segmentAnalyticsTrackEvent<CaseDocumentClickedEvent>(
            SegmentTrackedEventName.CaseDocumentClicked,
            {
                authSessionId: sessionId,
                userId: partyId,
                type: 'Download',
                documentId: docId,
            }
        );
    };

    return (
        <NavElement
            className={clsx(
                'text-left underline underline-offset-2',
                styles.actionPadding
            )}
            onClick={downloadDocument}
            size={NavElementSize.Small}
            title={`${t('general.download')} ${doc.displayName}`}
            type={NavElementType.Button}
        >
            {loading ? (
                // to do - add optional alt text?
                // alt={t('general.downloading')}
                <Loader />
            ) : (
                t('policy.documents.download')
            )}
        </NavElement>
    );
};

export const createViewDownloadAction = (
    doc: DocumentWithSource | V3DocumentWithSource,
    carrierCode: string,
    t: TFunction,
    label?: string
) => {
    return isPreviewSupported(doc) ? (
        <DocumentPreviewer
            className={clsx('!underline-offset-2', styles.actionPadding)}
            carrier={carrierCode}
            displayName={
                (doc.displayName || doc.documentId) ??
                ((doc as DocumentWithSource).documentID as string)
            }
            documentId={
                doc.documentId ??
                ((doc as DocumentWithSource).documentID as string)
            }
            activeDocType={doc.documentSource}
        >
            {label ? t(label) : t('view')}
        </DocumentPreviewer>
    ) : (
        <DownloadItem doc={doc} carrierCode={carrierCode} />
    );
};

export const createSendAction = (
    policyNumber: string,
    planCode: string | undefined,
    policyDeliveryDate: string | undefined,
    t: TFunction
) => {
    return (
        <NavElement
            className={clsx(
                'text-left underline underline-offset-2',
                styles.actionPadding,
                !policyDeliveryDate && styles.disabled
            )}
            href={`/contact-center/send-document?planCode=${planCode}&policyNumber=${policyNumber}&correlationId=${uuidV4()}`}
            size={NavElementSize.Small}
            title={`${t('general.send')}`}
            type={NavElementType.Link}
            disabled={!policyDeliveryDate}
        >
            {t('general.send')}
        </NavElement>
    );
};

export default function DocumentsResultsTable({
    carrierCode,
    documentType,
    linkedDocumentIdentifiers = [],
    policyNumber,
    results,
    planCode,
    policyDeliveryDate,
}: DocumentsResultsTableProps) {
    const { featureFlags } = useOptimizely();
    const pd = 'policy.documents';
    const { t } = useTranslation();

    return (
        <Table className="my-8" stickyColumn={TableStickyColumn.End}>
            <caption className="hidden">
                {`${policyNumber} ${t(`${pd}.documents`)}`}
            </caption>
            <TableHeader className="typography-content-body-sm-bold">
                <TableRow>
                    <TableHeaderCell>
                        <div className="flex flex-row items-center gap-1">
                            <Typography
                                variant={TypographyVariant.BodySmBold}
                                asTag="h3"
                            >
                                {t(`${pd}.documentId`)}
                            </Typography>
                            {documentType !==
                                DocumentTypeView.Correspondence && (
                                <Popover
                                    body={t(`${pd}.documentIdentifierTooltip`)}
                                    title={t(`${pd}.documentId`) as string}
                                    placement={PopoverPlacement.TopRight}
                                >
                                    <Icon
                                        type={IconType.CIRCLE_INFO}
                                        color="var(--color-base-icon-icon-action-text-link)"
                                        height={16}
                                        width={16}
                                    />
                                </Popover>
                            )}
                        </div>
                    </TableHeaderCell>
                    <TableHeaderCell>
                        {t(
                            documentType === DocumentTypeView.Correspondence
                                ? `${pd}.sentDate`
                                : `${pd}.receivedDate`
                        )}
                    </TableHeaderCell>
                    <TableHeaderCell>{t(`${pd}.fileType`)}</TableHeaderCell>
                    <TableHeaderCell>
                        <div
                            className={clsx(
                                'flex flex-row items-center gap-1',
                                styles.actionPadding
                            )}
                        >
                            <Typography
                                variant={TypographyVariant.BodySmBold}
                                asTag="h3"
                            >
                                {t(`${pd}.actions`)}
                            </Typography>
                            <Popover
                                body={t(`${pd}.actionsTooltip`)}
                                title={t(`${pd}.actions`) as string}
                                placement={PopoverPlacement.TopLeft}
                            >
                                <Icon
                                    type={IconType.CIRCLE_INFO}
                                    color="var(--color-base-icon-icon-action-text-link)"
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
                    const docDisplayId =
                        (document as DocumentWithSource).documentNumber ||
                        document.documentId ||
                        ((document as DocumentWithSource).documentID as string);
                    return (
                        <TableRow
                            className="disabled-tr"
                            key={`document-${
                                document.documentId ||
                                (document as DocumentWithSource).documentID
                            }`}
                        >
                            <TableCell>
                                <div className="flex flex-col items-start">
                                    <PiiWrapper>
                                        {document?.displayName || ''}
                                    </PiiWrapper>
                                    <div>
                                        {linkedDocumentIdentifiers.includes(
                                            docDisplayId
                                        ) ? (
                                            <Tooltip
                                                body={
                                                    t(`${pd}.linkedTo`, {
                                                        type:
                                                            document.documentType?.toLowerCase() ||
                                                            DEFAULT_ERROR_STRING,
                                                    }) as string
                                                }
                                                placement={
                                                    PopoverPlacement.TopRight
                                                }
                                            >
                                                <LinkIcon
                                                    className="-mt-0.5 mr-1.5 inline text-gray-600"
                                                    width={16}
                                                    height={16}
                                                />
                                            </Tooltip>
                                        ) : null}
                                        <Typography
                                            variant={TypographyVariant.BodySm}
                                            className="text-gray-600"
                                        >
                                            {docDisplayId}
                                        </Typography>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span>
                                    {convertKebabedDateString(
                                        document.documentDate
                                    )}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span>{document.fileType}</span>
                            </TableCell>
                            <TableCell>
                                {createViewDownloadAction(
                                    document,
                                    carrierCode,
                                    t
                                )}

                                {featureFlags.send_policy_pages &&
                                document.documentType === 'POLPG'
                                    ? createSendAction(
                                          policyNumber,
                                          planCode,
                                          policyDeliveryDate,
                                          t
                                      )
                                    : null}
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
                            {t(`${pd}.noResults`)}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
