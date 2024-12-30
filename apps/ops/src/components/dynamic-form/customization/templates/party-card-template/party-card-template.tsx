import { ArrayFieldTemplateProps, getUiOptions } from '@rjsf/utils';
import { Icon, IconType } from '@zinnia/bloom/components';
import { useEffect, useState } from 'react';

import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
export function PartyCardTemplate(props: ArrayFieldTemplateProps) {
    const { items, schema, formData, uiSchema } = props;
    const [columns, setColumns] = useState<{ [key: string]: string }>({});

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

    return (
        <>
            {schema.type === 'array' && (
                <div>
                    {formData.map((element: any, index: number) => (
                        // <div key={element.key}>
                        //     <div className="typography-header bg-gray-600">{element.title}</div>
                        // </div>
                        <div className="my-3 flex w-[436px] rounded border border-gray-100 p-[12px]" key={index}>
                            <div className="px-2">
                                <Icon width={20} height={20} type={IconType.DOCUMENT_TEXT} />{' '}
                            </div>
                            <div>
                                <div className="text-sm font-bold">
                                    <PiiWrapper>{element.title}</PiiWrapper>
                                </div>
                                <div className="flex items-center text-sm font-normal text-gray-300">
                                    <PiiWrapper>documentNumber</PiiWrapper>
                                </div>
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
