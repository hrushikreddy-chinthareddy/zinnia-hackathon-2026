import { useQueries } from '@tanstack/react-query';
import { AssistiveTextVariant, Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import React from 'react';

import AssistiveText from '@deps/components/assistive-text/assistive-text';
import { DocumentView } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-helpers';
import Content, { ContentVariant } from '@deps/components/content/content';
import CustomLoader from '@deps/components/loader/customLoader';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { createViewDownloadAction } from '@deps/containers/subpages/documents-sub-page/documents-results-table';
import { getEDSMetadata } from '@deps/queries/api/documents';
import { browserLogInfo } from '@deps/utils/browser-logging';

import styles from './documents-tab.module.css';

function SideSheetDocument({
    document,
    ...rest
}: { document: DocumentView } & React.HTMLAttributes<HTMLLIElement>) {
    const { t } = useTranslation();
    return (
        <li {...rest} className={styles.documentItem}>
            <div className={styles.documentItemContent}>
                <Icon
                    width={24}
                    height={24}
                    className={styles.documentItemIcon}
                    type={IconType.DOCUMENT_TEXT}
                />
                <div className={styles.documentItemText}>
                    <Content
                        variant={ContentVariant.BodySm}
                        details={document.name}
                    />
                    <Content
                        className={styles.documentId}
                        variant={ContentVariant.BodySm}
                        details={
                            t('caseOverview.sidesheet.documentId', {
                                documentId: document.id,
                            }) as string
                        }
                    />
                </div>
            </div>

            {createViewDownloadAction(
                {
                    ...document?.previewDocProps,
                    documentSource: document?.previewDocProps?.activeDocType,
                    fileType: document?.fileType || '',
                },
                (document?.previewDocProps?.carrier ?? '').toUpperCase(),
                t,
                'View'
            )}
        </li>
    );
}

export default function DocumentsTab({
    documentMetadata,
    ...rest
}: {
    documentMetadata: DocumentView[];
} & React.HTMLAttributes<HTMLDivElement>) {
    const { t } = useTranslation();

    const queryResults = useQueries({
        queries: (documentMetadata ?? []).map((doc) => ({
            queryKey: [
                'document-metadata',
                doc?.id,
                doc?.previewDocProps.carrier,
            ],
            queryFn: () => getEDSMetadata(doc.id),
        })),
    });

    const isLoading = queryResults.some((result) => result.isPending);
    const documents = queryResults
        .map((result, index) => ({
            result,
            originalDoc: documentMetadata[index],
        }))
        .filter(
            ({ result }) =>
                result.status === 'success' && result.data?.metadata?.documentId
        )
        .map(({ result, originalDoc }) => {
            const { metadata } = result.data!;

            browserLogInfo('Processing document metadata', metadata ?? {});

            return {
                ...originalDoc,
                id: metadata?.documentId ?? '',
                name: metadata?.displayName ?? metadata?.documentType ?? '',
                fileType: metadata?.fileType || '',
                previewDocProps: {
                    ...originalDoc?.previewDocProps,
                    activeDocType: metadata?.documentType,
                },
            } as DocumentView;
        });

    if (isLoading) {
        return (
            <div {...rest} className={styles.documentsTabLoading}>
                <CustomLoader size="small" />
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyStateInner}>
                    <Typography
                        variant={TypographyVariant.H4}
                        className={styles.emptyStateTitle}
                    >
                        {t('sideSheet.task.tabs.documents')}
                    </Typography>
                    <div className={styles.emptyStateBox}>
                        <AssistiveText
                            text={t('allFields.noDocuments')}
                            variant={AssistiveTextVariant.Default}
                            iconOverride={
                                <Icon
                                    width={16}
                                    height={16}
                                    type={IconType.DOCUMENT_TEXT}
                                />
                            }
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div {...rest} className={styles.documentsTab}>
            <Typography variant={TypographyVariant.H3}>
                {t('caseOverview.sidesheet.documents')}
            </Typography>
            <ul className={styles.documentList}>
                {documents?.map((document: DocumentView) => {
                    if (!document) {
                        return null;
                    }
                    return (
                        <SideSheetDocument
                            key={document.id}
                            document={document}
                        />
                    );
                })}
            </ul>
        </div>
    );
}
