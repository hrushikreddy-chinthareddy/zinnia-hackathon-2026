import { Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import {
    DocumentView,
    TransformedStep,
} from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-helpers';
import Content, { ContentVariant } from '@deps/components/content/content';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { createViewDownloadAction } from '@deps/containers/subpages/documents-sub-page/documents-results-table';

function SideSheetDocument({
    document,
    ...rest
}: { document: DocumentView } & React.HTMLAttributes<HTMLLIElement>) {
    const { t } = useTranslation();

    return (
        <li
            {...rest}
            className="mt-2 flex w-full flex-row items-center justify-between rounded-sm border-2 border-gray-100 px-4 py-3"
        >
            <div className="flex flex-row items-center justify-start gap-2">
                <Icon
                    width={24}
                    height={24}
                    className="shrink-0"
                    type={IconType.DOCUMENT_TEXT}
                />
                <div className="flex flex-col">
                    <Content
                        variant={ContentVariant.BodySm}
                        details={document.name}
                    />
                    <Content
                        className="text-gray-600"
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
    step,
    ...rest
}: { step: TransformedStep } & React.HTMLAttributes<HTMLDivElement>) {
    const { t } = useTranslation();
    return (
        <div {...rest}>
            <Typography variant={TypographyVariant.H3}>
                {t('caseOverview.sidesheet.documents')}
            </Typography>
            <ul className="mt-4">
                {step.documents?.map((document) => {
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
