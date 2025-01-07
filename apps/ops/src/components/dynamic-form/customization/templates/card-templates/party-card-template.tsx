import { ObjectFieldTemplateProps } from '@rjsf/utils';
import { Icon, IconType } from '@zinnia/bloom/components';

import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';

export function PartyCardTemplate(props: ObjectFieldTemplateProps) {
    const { formData } = props;
    console.log('🚀 ~ PartyCardTemplate ~ formData:', formData);

    const sideSheet = useSideSheetContext();

    const handleDocumentClick = (element: any) => {
        const content = <DetailsCard details={element} />;
        sideSheet.changeSideSheetContent(element.title, content);
        sideSheet.handleOpen(true);
    };

    return (
        <>
            <div className=" flex w-[436px] rounded border border-gray-100 p-[12px]" onClick={() => handleDocumentClick(formData)}>
                <div className="px-2">
                    <Icon width={25} height={25} type={IconType.CIRCLE_USER} />
                </div>
                <div className="grow">
                    <div className="text-sm font-bold">
                        <PiiWrapper>{formData.title}</PiiWrapper>
                    </div>
                    <div className="flex items-center text-sm font-normal text-gray-300">
                        <PiiWrapper>{formData.subTitle}</PiiWrapper>
                    </div>
                </div>
                <div>
                    <Icon width={25} height={25} type={IconType.CHEVRON_RIGHT} />
                </div>
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
