import { getUiOptions, ObjectFieldTemplateProps } from '@rjsf/utils';
import { Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import DocumentPreviewer from '@deps/components/document-viewer/document-previewer';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { formatSSN } from '@deps/helpers/string.helper';
import { replacePlaceholders } from '@deps/helpers/value-placement.helper';

export function CardTemplate(props: ObjectFieldTemplateProps) {
    const { formData, uiSchema, schema, formContext } = props;

    const { cardType, icon, sectionTitle } = getUiOptions(uiSchema);

    return (
        <>
            <SingleCard
                cardType={cardType as string}
                icon={icon as IconType}
                data={formData}
                properties={schema?.properties}
                sectionTitle={(sectionTitle as string) ?? ''}
                formData={formContext?.customData}
            />
        </>
    );
}

export type SingleCardProps = {
    cardType: string;
    icon: IconType;
    data: any;
    properties: any;
    sectionTitle?: string;
    className?: string;
    formData?: any;
};
export const SingleCard = ({ cardType, icon, data, properties, sectionTitle, className, formData }: SingleCardProps) => {
    const { t } = useTranslation();

    const sideSheet = useSideSheetContext();
    const title = properties ? Object.keys(properties)[0] : 'title';
    const subtitle = properties ? Object.keys(properties)[1] : 'subtitle';

    const displayProperties = properties
        ? Object.entries(properties)
              .filter(([key, prop]: [string, any]) => !prop.__additional_property)
              .map(([key, prop]: [string, any]) => ({ key, ...prop }))
        : [];

    const handleCardClick = () => {
        const content = <DetailsCard details={data} sectionTitle={sectionTitle} properties={displayProperties} />;
        sideSheet.changeSideSheetContent(data?.title || '', content);
        sideSheet.handleOpen(true);
    };

    return (
        <>
            <div className={`flex w-[436px] rounded border border-gray-100 p-[12px] ${className}`}>
                <div className="px-2">
                    <Icon width={25} height={25} type={IconType[icon as string as keyof typeof IconType] || IconType.CIRCLE_USER} />{' '}
                </div>
                <div className="grow">
                    <div className="text-sm font-bold">
                        <PiiWrapper>
                            {(title in properties && data?.title) ?? replacePlaceholders(properties?.title, data)?.default ?? ''}
                        </PiiWrapper>
                    </div>
                    <div className="flex items-center text-sm font-normal text-gray-300">
                        <PiiWrapper>
                            {properties?.[subtitle] && typeof properties[subtitle] !== 'boolean' && 'title' in properties[subtitle]
                                ? properties[subtitle].title
                                : ''}{' '}
                            {properties[subtitle].dataType === 'ssn'
                                ? formatSSN(data?.[subtitle] ?? replacePlaceholders(properties[subtitle], data)?.default ?? '')
                                : data?.[subtitle] ?? replacePlaceholders(properties[subtitle], data)?.default ?? ''}
                        </PiiWrapper>
                    </div>
                </div>
                {cardType === 'Detailed' && <DetailAction handleCardClick={handleCardClick} formData={data} />}
                {cardType === 'Document' && (
                    <DocumentActions
                        cardType={cardType}
                        document={replacePlaceholders(data, formData) || data}
                        properties={displayProperties}
                        t={t}
                    />
                )}
            </div>
        </>
    );
};

export const DetailsCard = ({ details, sectionTitle, properties }: any) => {
    return (
        <CardContainer classNames={'w-full'} containerClassNames="w-full content-divider">
            <div className="flex flex-col w-full">
                <Typography variant={TypographyVariant.H3} className="mb-3">
                    {sectionTitle}
                </Typography>
                {properties?.map((schema: any) => {
                    return (
                        <Typography variant={TypographyVariant.BodySm} key={schema.key} className="p-1">
                            {schema?.title}:{' '}
                            {schema?.dataType === 'ssn'
                                ? formatSSN(details[schema.key] ?? replacePlaceholders(schema, details)?.default ?? '--')
                                : details[schema.key] ?? replacePlaceholders(schema, details)?.default ?? '--'}
                        </Typography>
                    );
                })}
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
                        carrier={document?.carrier || ''}
                        displayName={document?.displayName || ''}
                        documentId={document?.documentId ?? (document?.documentID as string)}
                    >
                        {t('general.view')}
                    </DocumentPreviewer>
                </div>
            </>
        );
    }
    return null;
};
