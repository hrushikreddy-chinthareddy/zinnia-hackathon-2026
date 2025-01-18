import { getUiOptions, ObjectFieldTemplateProps } from '@rjsf/utils';
import { Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import DocumentDownloader from '@deps/components/document-viewer/document-downloader';
import DocumentPreviewer from '@deps/components/document-viewer/document-previewer';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/documents-content';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { useDocumentDownload } from '@deps/helpers/documents.helper';

export function CardTemplate(props: ObjectFieldTemplateProps) {
    const { formData, uiSchema, schema } = props;

    const { cardType, icon, sectionTitle } = getUiOptions(uiSchema);

    const sideSheet = useSideSheetContext();

    const { t } = useTranslation();
    const [loading, download] = useDocumentDownload(
        formData.documentId || (formData.documentID as string),
        formData.documentSource,
        'WELB',
        formData.displayName
    );

    const [viewLoading, view] = useDocumentDownload(
        formData.documentId || (formData.documentID as string),
        formData.documentSource,
        'WELB',
        formData.displayName
    );

    const title = schema?.properties ? Object.keys(schema?.properties)[0] : 'title';
    const subtitle = schema?.properties ? Object.keys(schema?.properties)[1] : 'subtitle';
    const displayProperties = schema?.properties
        ? Object.entries(schema.properties)
              .filter(([key, prop]: [string, any]) => !prop.__additional_property)
              .map(([key, prop]: [string, any]) => ({ key, ...prop }))
        : [];

    const handleCardClick = () => {
        console.log('🚀 ~ DetailsCard ~ displayProperties:', displayProperties);
        const content = <DetailsCard details={formData} sectionTitle={sectionTitle} properties={displayProperties} />;
        sideSheet.changeSideSheetContent(formData[title], content);
        sideSheet.handleOpen(true);
    };

    return (
        <>
            <div className=" flex w-[436px] rounded border border-gray-100 p-[12px]">
                <div className="px-2">
                    <Icon width={25} height={25} type={IconType[icon as keyof typeof IconType]} />
                </div>
                <div className="grow">
                    <div className="text-sm font-bold">
                        <PiiWrapper>{formData[title]}</PiiWrapper>
                    </div>
                    <div className="flex items-center text-sm font-normal text-gray-300">
                        <PiiWrapper>
                            {schema?.properties?.[subtitle] &&
                            typeof schema.properties[subtitle] !== 'boolean' &&
                            'title' in schema.properties[subtitle]
                                ? schema.properties[subtitle].title
                                : ''}
                            {formData[subtitle]}
                        </PiiWrapper>
                    </div>
                </div>
                {cardType === 'Detailed' && displayProperties.length > 2 && (
                    <DetailAction handleCardClick={handleCardClick} formData={formData} />
                )}
                {cardType === 'Document' && (
                    <DocumentActions cardType={cardType} document={formData} download={download} loading={loading} t={t} />
                )}
            </div>
        </>
    );
}

const DetailsCard = ({ details, sectionTitle, properties }: any) => {
    return (
        <CardContainer classNames={'w-full'} containerClassNames="w-full content-divider">
            <div className="flex flex-col w-full">
                <Typography variant={TypographyVariant.H3} className="mb-3">
                    {sectionTitle}
                </Typography>
                {properties?.map((schema: any) => (
                    <Typography variant={TypographyVariant.BodySm} key={schema.key} className="p-1">
                        {schema?.title}: {details[schema.key] ?? '--'}
                    </Typography>
                ))}
            </div>
        </CardContainer>
    );
};

const DetailAction = ({ handleCardClick }: any) => {
    return (
        <div onClick={handleCardClick}>
            <Icon width={25} height={25} type={IconType.CHEVRON_RIGHT} />
        </div>
    );
};

const DocumentActions = ({ cardType, document, t }: any) => {
    if (cardType === 'Document') {
        return (
            <>
                <div className="px-4">
                    <DocumentPreviewer
                        className="flex max-w-[234px] gap-1"
                        activeDocType={DocumentTypeView.Case}
                        carrier={'WELB'} //todo: vijaya carrier mapping
                        displayName={document.displayName}
                        documentId={document.documentId ?? (document.documentID as string)}
                    >
                        {t('general.view')}
                    </DocumentPreviewer>
                </div>
                <div className="px-4">
                    <DocumentDownloader
                        carrierCode={'WELB'} //todo: vijaya carrier mapping
                        documentId={document.documentId}
                        documentName={document.documentName}
                        documentType={DocumentTypeView.Case}
                    />
                </div>
            </>
        );
    }
    return null;
};
