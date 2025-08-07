import { getUiOptions, ObjectFieldTemplateProps } from '@rjsf/utils';
import { MetadataSearchResponse } from '@xd/api-types/dist/generated-types/documents-v3';
import { toTitleCase } from '@xd/utils/dist';
import { Icon, IconType, Loader } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import React from 'react';

import DocumentPreviewer from '@deps/components/document-viewer/document-previewer';
import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormattedAddress } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import { DocumentWithSource } from '@deps/containers/subpages/documents-sub-page/documents-sub-page';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import {
    formatSSN,
    formatDate,
    formatRelationshipEnum,
    formatPercentage,
    formatPhone,
    isNullEmptyOrUndefined,
} from '@deps/helpers/string.helpers';
import {
    formatDirtyAddress,
    replacePlaceholders,
} from '@deps/helpers/value-placement.helpers';
import { useDocumentDownload } from '@deps/hooks/useDocumentDownload';
import {
    CardTypes,
    DataFormattingTypes,
    TaskFieldTypes,
} from '@deps/models/case/task';

import style from './card-template.module.css';

const getUiOptionsByField = (
    properties: Record<string, any>,
    fieldType: TaskFieldTypes
) => {
    return properties
        ? Object.entries(properties)
              .filter(
                  ([key, prop]: [string, any]) =>
                      !prop.__additional_property &&
                      (properties[key] as any)['ui:field'] === fieldType
              )
              .map(([key, prop]: [string, any]) => ({ key, ...prop }))
        : [];
};

export function CardTemplate(props: ObjectFieldTemplateProps) {
    const { formData, uiSchema, schema, formContext, properties } = props;
    const schemaProperties = schema?.properties;
    const { cardType, icon, sectionTitle } = getUiOptions(uiSchema);

    const formFields = schemaProperties
        ? getUiOptionsByField(schemaProperties, TaskFieldTypes.Form)
        : [];

    const additionalInfoFields = schemaProperties
        ? getUiOptionsByField(schemaProperties, TaskFieldTypes.AdditionalInfo)
        : [];
    return (
        <>
            {schema.title && (
                <Typography
                    variant={TypographyVariant.BodySmBold}
                    className="mb-5"
                >
                    {schema.title}
                </Typography>
            )}
            <div className="flex gap-2">
                <SingleCard
                    cardType={cardType as CardTypes}
                    icon={icon as IconType}
                    data={formData}
                    properties={schema?.properties}
                    sectionTitle={(sectionTitle as string) ?? ''}
                    formData={formContext?.customData}
                />

                {additionalInfoFields.length > 0 && (
                    <div className="flex flex-row">
                        {additionalInfoFields
                            .filter((element) => {
                                return !element.hidden;
                            })
                            .map((element) => {
                                const fieldContent = properties.find(
                                    (item) => item.name === element.key
                                )?.content;
                                const elementUiOptions = getUiOptions(
                                    fieldContent?.props?.uiSchema
                                );

                                return (
                                    <div key={element.key}>
                                        <div
                                            className={clsx(
                                                style.additionalInfo,
                                                style[
                                                    elementUiOptions?.type as string
                                                ],
                                                'flex flex-row'
                                            )}
                                        >
                                            {elementUiOptions?.icon && (
                                                <div className="mt-1">
                                                    <Icon
                                                        type={
                                                            IconType[
                                                                elementUiOptions?.icon as string as keyof typeof IconType
                                                            ]
                                                        }
                                                        height={20}
                                                        width={20}
                                                        className={style.icon}
                                                    />
                                                </div>
                                            )}

                                            {
                                                properties.find(
                                                    (item) =>
                                                        item.name ===
                                                        element.key
                                                )?.content
                                            }
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>
            {formFields?.length > 0 && (
                <div className={`py-2`}>
                    {formFields
                        .filter((element) => {
                            return !element.hidden;
                        })
                        .map((element) => {
                            return (
                                <div
                                    key={element.key}
                                    className={'property-wrapper flex flex-col'}
                                >
                                    {
                                        properties.find(
                                            (item) => item.name === element.key
                                        )?.content
                                    }
                                </div>
                            );
                        })}
                </div>
            )}
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
        .filter(([, value]) => (value as any)['ui:field'] === fieldName)
        .map(([, value]) => value as Record<string, any>);

    const keys = Object.entries(properties)
        .filter(([, value]) => (value as any)['ui:field'] === fieldName)
        .map(([key]) => key);

    // Extract separator & placeholder once
    const separator =
        field.length > 0 && typeof field[0]?.['ui:separator'] === 'string'
            ? field[0]['ui:separator']
            : ' ';
    const placeholder =
        field.length > 0 && typeof field[0]?.['ui:placeholder'] === 'string'
            ? field[0]['ui:placeholder'] + ' '
            : '';

    const value = keys
        .reduce((result, key) => {
            const fieldSchema = properties[key] || {};
            const defaultValue =
                replacePlaceholders(fieldSchema, data)?.default || '';
            const fieldValue =
                data?.[key] !== undefined &&
                data?.[key] !== fieldSchema?.default
                    ? data[key]
                    : defaultValue;
            if (fieldValue) {
                result += (result ? separator : '') + fieldValue;
            }
            return result;
        }, '')
        ?.trim();

    if (value === '') {
        return {
            field,
            keys,
            value: properties.title || properties.subTitle || '',
        };
    }

    return { field, keys, value: value ? placeholder + value : '' };
};

export const formatValueByDataType = (dataType: string, value: any) => {
    switch (dataType) {
        case DataFormattingTypes.SSN:
            return formatSSN(value);
        case DataFormattingTypes.Amount:
            return numberFormatify(Math.abs(value));
        case DataFormattingTypes.DirtyAddress: {
            if (!value) return null;
            try {
                const addressValue =
                    typeof value === 'string' && value.startsWith('{')
                        ? JSON.parse(value)
                        : value;
                const addr = formatDirtyAddress(addressValue);
                const className = Object.hasOwn(addressValue, 'addressLines')
                    ? 'pl-1 inline-grid'
                    : '';
                return (
                    <FormattedAddress address={addr} className={className} />
                );
            } catch (error) {
                console.error('Error parsing address value:', error);
                return null;
            }
        }
        case DataFormattingTypes.Button: {
            return <button className="bg-gray-100 text-gray-300">Edit</button>;
        }
        case DataFormattingTypes.Date:
            return formatDate(value);
        case DataFormattingTypes.Phone: {
            const phoneValue =
                typeof value === 'string' && value.startsWith('{')
                    ? JSON.parse(value)
                    : value;
            const phone = formatPhone(phoneValue);
            return !isNullEmptyOrUndefined(phone) ? phone : '-';
        }
        case DataFormattingTypes.RelationshipToInsured:
            return formatRelationshipEnum(value);
        case DataFormattingTypes.TitleCase:
            return toTitleCase(value);

        case DataFormattingTypes.Percentage:
            return formatPercentage(value);
        default:
            return value;
    }
};

export const SingleCard = ({
    cardType,
    icon,
    data,
    properties,
    sectionTitle,
    className,
    formData,
}: SingleCardProps) => {
    const { t } = useTranslation();
    const sideSheet = useSideSheetContext();

    const title = extractField(properties, data, TaskFieldTypes.Title);
    const subtitle = extractField(properties, data, TaskFieldTypes.Subtitle);

    if (
        (!title?.value &&
            !subtitle?.value &&
            cardType !== CardTypes.Document &&
            !data?.documentId) ||
        (cardType === CardTypes.Document && !data?.documentId)
    ) {
        return;
    }

    const displayProperties = properties
        ? Object.entries(properties)
              .filter(
                  ([key, prop]: [string, any]) =>
                      !prop.__additional_property &&
                      ![
                          TaskFieldTypes.AdditionalInfo,
                          TaskFieldTypes.hidden,
                      ].includes((properties[key] as any)['ui:field'])
              )
              .map(([key, prop]: [string, any]) => ({ key, ...prop }))
        : [];
    const handleCardClick = () => {
        const content = (
            <DetailsCard
                details={data}
                sectionTitle={sectionTitle}
                properties={displayProperties}
            />
        );
        sideSheet.changeSideSheetContent(title.value || '', content);
        sideSheet.handleOpen(true);
    };

    return (
        <>
            <div
                className={`flex w-[455px] rounded border border-gray-100 p-[12px] ${className}`}
            >
                <div className="px-2">
                    <Icon
                        width={25}
                        height={25}
                        type={
                            IconType[icon as string as keyof typeof IconType] ||
                            IconType.CIRCLE_USER
                        }
                    />{' '}
                </div>
                <div className="grow">
                    <div className="text-sm font-bold break-all">
                        {title?.field?.[0] && (
                            <PiiWrapper>
                                {formatValueByDataType(
                                    title.field[0].dataType,
                                    title.value
                                )}
                            </PiiWrapper>
                        )}
                    </div>
                    <div className="flex items-center text-sm font-normal text-gray-300">
                        <PiiWrapper>
                            {subtitle?.field?.[0] && subtitle?.field[0]?.title
                                ? subtitle?.field[0].title + ': '
                                : ''}{' '}
                            {subtitle?.field?.[0] &&
                                formatValueByDataType(
                                    subtitle?.field?.[0]?.dataType,
                                    subtitle?.value || '--'
                                )}
                        </PiiWrapper>
                    </div>
                </div>
                {cardType === CardTypes.Detailed && (
                    <div onClick={handleCardClick}>
                        <Icon
                            width={25}
                            height={25}
                            type={IconType.CHEVRON_RIGHT}
                        />
                    </div>
                )}
                {cardType === CardTypes.Document && (
                    <DocumentActions
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
        <CardContainer classNames={'w-full'} containerClassNames="w-full">
            <div className="flex flex-col w-full">
                <Typography variant={TypographyVariant.H3} className="mb-3">
                    {sectionTitle}
                </Typography>
                {properties?.map((schema: any) => {
                    return (
                        <Typography
                            variant={TypographyVariant.BodySm}
                            key={schema.key}
                            className="p-1"
                        >
                            {schema?.title}:{' '}
                            {formatValueByDataType(
                                schema?.dataType,
                                details[schema.key] &&
                                    details[schema.key] !== schema.default
                                    ? details[schema.key]
                                    : replacePlaceholders(schema, details)
                                          ?.default ?? '--'
                            )}
                        </Typography>
                    );
                })}
            </div>
        </CardContainer>
    );
};

export const DocumentActions = ({ document, t }: any) => {
    const docId =
        document.documentId ||
        ((document as DocumentWithSource).documentID as string);

    const [loading, download] = useDocumentDownload(
        docId,
        (document as DocumentWithSource).documentSource ||
            (document as MetadataSearchResponse).documentClassification,
        document.carrier,
        document.displayName || docId,
        document.fileType
    );

    const handleClick = (event: React.MouseEvent) => {
        event.preventDefault();
        download();
    };

    return (
        <>
            <div className="px-4">
                <DocumentPreviewer
                    className="flex max-w-[234px] pt-1"
                    activeDocType={DocumentTypeView.Case}
                    carrier={document?.carrier || ''}
                    displayName={document?.displayName || ''}
                    documentId={
                        document?.documentId ?? (document?.documentID as string)
                    }
                >
                    {t('general.view')}
                </DocumentPreviewer>
            </div>
            <div className="px-2">
                <NavElement
                    onClick={handleClick}
                    size={NavElementSize.Small}
                    title={`${t('general.download')} ${
                        document?.displayName || ''
                    }`}
                    type={NavElementType.Button}
                >
                    {loading ? (
                        // to do - add optional alt text?
                        // alt={t('general.downloading')}
                        <Loader />
                    ) : (
                        <Icon width={20} height={20} type={IconType.DOWNLOAD} />
                    )}
                </NavElement>
            </div>
        </>
    );
};
