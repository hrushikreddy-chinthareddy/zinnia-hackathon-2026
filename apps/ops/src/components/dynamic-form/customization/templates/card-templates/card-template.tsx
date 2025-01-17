import { getUiOptions, ObjectFieldTemplateProps } from '@rjsf/utils';
import { Icon, IconType } from '@zinnia/bloom/components';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { useDocumentDownload } from '@deps/helpers/documents.helper';
import loadingImage from '@deps/styles/images/loader.png';

//todo:vijaya:keeping for ref. remove later
function getKeyByFieldType(schema: any, fieldType: string) {
    if (schema.properties) {
        for (const key in schema?.properties) {
            if (schema?.properties[key].fieldType === fieldType) {
                return key;
            }
        }
    }
    return null; // Return null if no match is found
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
export function CardTemplate(props: ObjectFieldTemplateProps) {
    const { formData, uiSchema, schema } = props;

    const { cardType, icon } = getUiOptions(uiSchema);

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

    const handleDocumentClick = (element: any) => {
        const content = <DetailsCard details={element} />;
        sideSheet.changeSideSheetContent(element.payorName, content);
        sideSheet.handleOpen(true);
    };

    const title = schema?.properties ? Object.keys(schema?.properties)[0] : 'title';
    const subtitle = schema?.properties ? Object.keys(schema?.properties)[1] : 'subtitle';

    const displayProperties = schema?.properties ? Object.values(schema.properties).filter((prop: any) => !prop.__additional_property) : [];

    return (
        <>
            <div
                className=" flex w-[436px] rounded border border-gray-100 p-[12px]"
                onClick={() => (displayProperties.length > 2 ? handleDocumentClick(formData) : noop)}
            >
                <div className="px-2">
                    <Icon width={25} height={25} type={IconType[icon as keyof typeof IconType]} />
                </div>
                <div className="grow">
                    <div className="text-sm font-bold">
                        <PiiWrapper>{formData[title]}</PiiWrapper>
                    </div>
                    <div className="flex items-center text-sm font-normal text-gray-300">
                        <PiiWrapper>
                            {(schema.properties &&
                                schema.properties[subtitle] &&
                                typeof schema.properties[subtitle] === 'object' &&
                                (schema && schema.properties && schema.properties[subtitle])?.title) ??
                                ''}
                            {formData[subtitle]}
                        </PiiWrapper>
                    </div>
                </div>
                {cardType === 'Detail' && displayProperties.length > 2 && (
                    <div>
                        <Icon width={25} height={25} type={IconType.CHEVRON_RIGHT} />
                    </div>
                )}
                {cardType === 'Document' && (
                    <>
                        <div className="px-4">
                            <NavElement
                                className="text-left underline underline-offset-2"
                                onClick={view}
                                size={NavElementSize.Small}
                                title={`${t('general.download')} `}
                                type={NavElementType.Button}
                                variant={NavElementVariant.Secondary}
                            >
                                {viewLoading ? (
                                    <Image
                                        alt={t('general.view')}
                                        className="transform-origin-center duration-2000 animate-spin ease-linear"
                                        height={20}
                                        src={loadingImage}
                                        width={20}
                                    />
                                ) : (
                                    t('general.view')
                                )}
                            </NavElement>
                        </div>

                        <div className="px-4">
                            <NavElement
                                className="text-left underline underline-offset-2"
                                onClick={download}
                                size={NavElementSize.Small}
                                type={NavElementType.Button}
                                variant={NavElementVariant.Secondary}
                            >
                                {loading ? (
                                    <Image
                                        alt={t('general.download')}
                                        className="transform-origin-center duration-2000 animate-spin ease-linear"
                                        height={20}
                                        src={loadingImage}
                                        width={20}
                                    />
                                ) : (
                                    <Icon width={20} height={20} type={IconType.DOWNLOAD} />
                                )}
                            </NavElement>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

const DetailsCard = ({ title, details }: any) => {
    return (
        <div className="flex h-full flex-col p-2">
            <div className="overflow-y-scroll">
                <div className="flex flex-col">
                    <label className="font-primary text-[12px] font-bold text-gray-900">{title}</label>
                    {Object.keys(details).length > 0 &&
                        Object.keys(details).map((key: string) => (
                            <Typography variant={TypographyVariant.BodySm} key={key}>
                                {key}: {details[key]}
                            </Typography>
                        ))}
                </div>
            </div>
        </div>
    );
};
