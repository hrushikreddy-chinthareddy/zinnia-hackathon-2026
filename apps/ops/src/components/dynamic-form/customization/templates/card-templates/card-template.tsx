import { getUiOptions, ObjectFieldTemplateProps } from '@rjsf/utils';
import { Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { MetadataSearchResponse } from 'node_modules/@zinnia/api-types/dist/generated-types/documents-v3/models/MetadataSearchResponse';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';

import DocumentPreviewer from '@deps/components/document-viewer/document-previewer';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { DocumentWithSource } from '@deps/containers/subpages/documents-sub-page/documents-sub-page';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { formatSSN, toSentenceCase } from '@deps/helpers/string.helper';
import { formatDirtyAddress, replacePlaceholders } from '@deps/helpers/value-placement.helper';
import { useDocumentDownload } from '@deps/hooks/useDocumentDownload';
import { CardTypes, DataFormattingTypes } from '@deps/models/case/task';
import { ContentVariant } from '@deps/components/content/content';
import Content from '@deps/components/content/content';
import loadingImage from '@deps/styles/images/loader.png';
import Image from 'next/image';

export function CardTemplate(props: ObjectFieldTemplateProps) {
    const { formData, uiSchema, schema, formContext } = props;

    const { cardType, icon, sectionTitle } = getUiOptions(uiSchema);

    return (
        <>
            {schema.title && (
                <Typography variant={TypographyVariant.BodySmBold} className="mb-5">
                    {schema.title}
                </Typography>
            )}
            <SingleCard
                cardType={cardType as CardTypes}
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
    cardType: CardTypes;
    icon: IconType;
    data: any;
    properties: any;
    sectionTitle?: string;
    className?: string;
    formData?: any;
};

const extractField = (
    properties: Record<string, any>,
    data: Record<string, any>,
    fieldName: string
): { field: Record<string, any>[]; keys: string[]; value: string } => {
    const field = Object.entries(properties)
        .filter(([_, value]) => (value as any)['ui:field'] === fieldName)
        .map(([_, value]) => value as Record<string, any>); // Explicitly type field as an array of objects

    const keys = Object.entries(properties)
        .filter(([_, value]) => (value as any)['ui:field'] === fieldName)
        .map(([key]) => key);

    // Extract separator & placeholder once
    const separator = field.length > 0 && typeof field[0]?.['ui:separator'] === 'string' ? field[0]['ui:separator'] : ' ';
    const placeholder = field.length > 0 && typeof field[0]?.['ui:placeholder'] === 'string' ? field[0]['ui:placeholder'] + ' ' : '';

    const value = keys
        .reduce((result, key) => {
            const fieldSchema = properties[key] || {};
            const defaultValue = replacePlaceholders(fieldSchema, data)?.default || '';
            const fieldValue = data?.[key] !== undefined ? data[key] : defaultValue;
            if (fieldValue) {
                result += (result ? separator : '') + toSentenceCase(fieldValue);
            }
            return result;
        }, '')
        ?.trim();

    return { field, keys, value: value ? placeholder + value : '' };
};

export const formatValueByDataType = (dataType: string, value: any) => {
    switch (dataType) {
        case DataFormattingTypes.SSN:
            return formatSSN(value);
        case DataFormattingTypes.Amount:
            return numberFormatify(Math.abs(value));
        case DataFormattingTypes.DirtyAddress: {
            return formatDirtyAddress(JSON.parse(value));
        }
        default:
            return value;
    }
};

export const SingleCard = ({ cardType, icon, data, properties, sectionTitle, className, formData }: SingleCardProps) => {
    const { t } = useTranslation();

    const sideSheet = useSideSheetContext();

    const title = extractField(properties, data, 'title');
    const subtitle = extractField(properties, data, 'subTitle');

    if (
        (!title?.value && !subtitle?.value && cardType !== CardTypes.Document && !data?.documentId) ||
        (cardType === CardTypes.Document && !data?.documentId)
    ) {
        return;
    }

    const displayProperties = properties
        ? Object.entries(properties)
              .filter(([_, prop]: [string, any]) => !prop.__additional_property)
              .map(([key, prop]: [string, any]) => ({ key, ...prop }))
        : [];

    const handleCardClick = () => {
        const content = <DetailsCard details={data} sectionTitle={sectionTitle} properties={displayProperties} />;
        sideSheet.changeSideSheetContent(title.value || '', content);
        sideSheet.handleOpen(true);
    };

    return (
        <>
            {cardType === CardTypes.Document ? (
                <DocumentActions document={replacePlaceholders(data, formData) || data} properties={displayProperties} t={t} />
            ) : (
                <div className={`flex w-[455px] rounded border border-gray-100 p-[12px] ${className}`}>
                    <div className="px-2">
                        <Icon width={25} height={25} type={IconType[icon as string as keyof typeof IconType] || IconType.CIRCLE_USER} />{' '}
                    </div>
                    <div className="grow">
                        <div>
                            {title?.field?.[0] && (
                                <PiiWrapper>
                                    <Content
                                        className="min-w-max  break-all"
                                        variant={ContentVariant.BodySm}
                                        details={formatValueByDataType(title.field[0].dataType, title.value)}
                                    />
                                </PiiWrapper>
                            )}
                        </div>
                        {subtitle?.field?.[0] && (
                            <div className="flex">
                                <Content
                                    className="text-[--color-base-text-text-secondary]"
                                    variant={ContentVariant.BodySm}
                                    details={subtitle?.field[0]?.title ? subtitle?.field[0].title + ': ' : ''}
                                />{' '}
                                <PiiWrapper>
                                    <Content
                                        className="text-[--color-base-text-text-secondary]"
                                        variant={ContentVariant.BodySm}
                                        details={formatValueByDataType(subtitle?.field?.[0]?.dataType, subtitle?.value)}
                                    />
                                </PiiWrapper>
                            </div>
                        )}
                    </div>

                    <div onClick={handleCardClick}>
                        <Icon width={25} height={25} type={IconType.CHEVRON_RIGHT} />
                    </div>
                </div>
            )}
        </>
    );
};

export const DetailsCard = ({ details, sectionTitle, properties }: any) => {
    return (
        <CardContainer classNames={'w-full'} containerClassNames="w-full">
            <div className="flex flex-col w-full">
                <Typography variant={TypographyVariant.H3} className="mb-3">
                    {sectionTitle}
                </Typography>
                {properties?.map((schema: any) => {
                    return (
                        <div key={schema.key} className="grid grid-cols-3 gap-2 text-md align-center mb-1">
                            <Content
                                className="min-w-max text-[--color-base-text-text-secondary] colspan-1"
                                variant={ContentVariant.BodySm}
                                details={schema?.title}
                            />
                            <Content
                                className="min-w-max colspan-2"
                                variant={ContentVariant.BodySm}
                                details={formatValueByDataType(
                                    schema?.dataType,
                                    details[schema.key] ?? replacePlaceholders(schema, details)?.default ?? '--'
                                )}
                            />
                        </div>
                    );
                })}
            </div>
        </CardContainer>
    );
};

const DocumentActions = ({ document, t }: any) => {
    const docId = document.documentId || ((document as DocumentWithSource).documentID as string);

    const [loading, download] = useDocumentDownload(
        docId,
        (document as DocumentWithSource).documentSource || (document as MetadataSearchResponse).documentClassification,
        document.carrier,
        document.displayName || docId,
        document.fileType
    );

    const handleClick = (event: React.MouseEvent) => {
        event.preventDefault();
        download();
    };

    return (
        <li className="flex w-[455px] items-center justify-between rounded-sm border-2 border-gray-100 px-4 py-3">
            <div className="flex flex-row items-center justify-start gap-2">
                <Icon width={24} height={24} className="shrink-0" type={IconType.DOCUMENT_TEXT} />
                <div className="flex flex-col">
                    <Content variant={ContentVariant.BodySm} details={document.documentName} />
                    <Content
                        className="text-gray-600"
                        variant={ContentVariant.BodySm}
                        details={t('caseOverview.sidesheet.documentType', { documentType: document.documentType }) as string}
                    />
                </div>
            </div>
            <DocumentPreviewer {...document}>{t('caseOverview.sidesheet.view')}</DocumentPreviewer>
            <NavElement
                onClick={handleClick}
                size={NavElementSize.Small}
                title={`${t('general.download')} ${document?.displayName}`}
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
                    <Icon width={20} height={20} type={IconType.DOWNLOAD} />
                )}
            </NavElement>
        </li>
    );
};
