import { ArrayFieldTemplateProps } from '@rjsf/utils';
import { Icon, IconType } from '@zinnia/bloom/components';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { useDocumentDownload } from '@deps/helpers/documents.helper';
import loadingImage from '@deps/styles/images/loader.png';
enum CardTypes {
    Document = 'Document',
    Party = 'Party',
}
export function PartyCardTemplate(props: ArrayFieldTemplateProps) {
    const { schema, formData, uiSchema } = props;

    const sideSheet = useSideSheetContext();

    const handleDocumentClick = (element: any) => {
        const content = <DetailsCard details={element} />;
        sideSheet.changeSideSheetContent(element.title, content);
        sideSheet.handleOpen(true);
    };

    const card = (cardType: CardTypes, element: any) => {
        switch (cardType) {
            case CardTypes.Party:
                return (
                    <div className=" flex w-[436px] rounded border border-gray-100 p-[12px]" onClick={() => handleDocumentClick(element)}>
                        <div className="px-2">
                            <Icon width={25} height={25} type={IconType.CIRCLE_USER} />
                        </div>
                        <div className="grow">
                            <div className="text-sm font-bold">
                                <PiiWrapper>{element.title}</PiiWrapper>
                            </div>
                            <div className="flex items-center text-sm font-normal text-gray-300">
                                <PiiWrapper>{element.subTitle}</PiiWrapper>
                            </div>
                        </div>
                        <div>
                            <Icon width={25} height={25} type={IconType.CHEVRON_RIGHT} />
                        </div>
                    </div>
                );
            case CardTypes.Document:
                return <DownloadCard element={element} />;
        }
    };

    return (
        <>
            {props?.title && uiSchema?.title && (
                <div className={'flex my-2'}>
                    <div>{props.title}</div>
                </div>
            )}
            {schema.type === 'array' && (
                <div>
                    {formData.map((element: any, index: number) => (
                        <div key={index}>{card(uiSchema?.props?.type, element)}</div>
                    ))}
                </div>
            )}
        </>
    );
}

export default PartyCardTemplate;

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

const DownloadCard = ({ element }: any) => {
    const { t } = useTranslation();
    const [loading, download] = useDocumentDownload(
        element.documentId || (element.documentID as string),
        element.documentSource,
        'WELB',
        element.displayName
    );
    return (
        <div className=" flex w-[436px] rounded border border-gray-100 p-[12px]">
            <div className="px-2">
                <Icon width={25} height={25} type={IconType.DOCUMENT_TEXT} />
            </div>
            <div className="grow">
                <div className="text-sm font-bold">
                    <PiiWrapper>{element.documentId}</PiiWrapper>
                </div>
                <div className="flex items-center text-sm font-normal text-gray-300">
                    <PiiWrapper>{element.documentName}</PiiWrapper>
                </div>
            </div>
            <div className="px-4">
                <NavElement
                    className="text-left underline underline-offset-2"
                    onClick={download}
                    size={NavElementSize.Small}
                    title={`${t('general.download')} `}
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
            </div>
            <div>
                <Icon width={25} height={25} type={IconType.DOWNLOAD} />
            </div>
        </div>
    );
};
