import { ArrayFieldTemplateProps, getUiOptions } from '@rjsf/utils';
import { Icon, IconType } from '@zinnia/bloom/components';
import { useEffect, useState } from 'react';

import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
export function PartyCardTemplate(props: ArrayFieldTemplateProps) {
    const { items, schema, formData, uiSchema } = props;
    const [columns, setColumns] = useState<{ [key: string]: string }>({});
    const sideSheet = useSideSheetContext();
    useEffect(() => {
        const cols: { [key: string]: string } = {};
        if (items.length > 0) {
            const properties = items[0].schema.properties;
            for (const property in properties) {
                if (getUiOptions(uiSchema?.items[property]).widget !== 'hidden') {
                    cols[property] = (properties[property] as any).title;
                }
            }
        }
        setColumns(cols);
    }, [items, uiSchema]);

    const handleDocumentClick = (element: any) => {
        const content = <DetailsCard details={element} />;
        sideSheet.changeSideSheetContent(element.title, content);
        sideSheet.handleOpen(true);
    };
    return (
        <>
            {props?.title && (
                <div className={'flex my-2'}>
                    <div>{props.title}</div>
                </div>
            )}
            {schema.type === 'array' && (
                // todo: vijaya: check the schema keys
                <div>
                    {formData.map((element: any, index: number) => (
                        <div
                            className="my-3 flex w-[436px] rounded border border-gray-100 p-[12px]"
                            key={index}
                            onClick={() => handleDocumentClick(element)}
                        >
                            <div className="px-2">
                                <Icon width={20} height={20} type={IconType.CIRCLE_USER} />{' '}
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
                                <Icon width={20} height={20} type={IconType.CHEVRON_RIGHT} />
                            </div>
                            {/* <div className="flex items-center">{createAction(workingDocument, clientCode?.toUpperCase(), t)}</div> */}
                        </div>
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
