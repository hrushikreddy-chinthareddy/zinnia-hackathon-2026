import { ObjectFieldTemplateProps } from '@rjsf/utils';
import { Icon, IconType } from '@zinnia/bloom/components';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { useDocumentDownload } from '@deps/helpers/documents.helper';
import loadingImage from '@deps/styles/images/loader.png';
export function DocumentCardTemplate(props: ObjectFieldTemplateProps) {
    const { formData } = props;

    const { t } = useTranslation();
    const [loading, download] = useDocumentDownload(
        formData.documentId || (formData.documentID as string),
        formData.documentSource,
        'WELB',
        formData.displayName
    );
    return (
        <div className=" flex w-[436px] rounded border border-gray-100 p-[12px]">
            <div className="px-2">
                <Icon width={25} height={25} type={IconType.DOCUMENT_TEXT} />
            </div>
            <div className="grow">
                <div className="text-sm font-bold">
                    <PiiWrapper>{formData.documentId}</PiiWrapper>
                </div>
                <div className="flex items-center text-sm font-normal text-gray-300">
                    <PiiWrapper>{formData.documentName}</PiiWrapper>
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
}
