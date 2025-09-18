import { getUiOptions, ObjectFieldTemplateProps } from '@rjsf/utils';

import { helpInformation } from '../field-template/field-template';
import styles from '../field-template/field-template.module.css';

const widthClass = (width: number) => {
    return width === 100
        ? 'w-full lg:basis-[calc(100%-0.25rem)] '
        : width === 75
        ? 'w-full lg:basis-[calc(75%-0.25rem)]'
        : width === 60
        ? 'w-full lg:basis-[calc(60%-0.25rem)]'
        : width === 50
        ? 'w-full lg:basis-[calc(50%-0.25rem)]'
        : width === 33
        ? 'xs:basis-[calc(50%-0.25rem)] lg:basis-[calc(33%-0.25rem)]'
        : width === 25
        ? 'xs:basis-[calc(50%-0.25rem)] lg:basis-[calc(25%-0.25rem)]'
        : 'xs:basis-[calc(50%-0.25rem)] lg:basis-[calc(20%-0.25rem)]';
};

export default function AddressFieldTemplate({
    properties,
    uiSchema = {},
    title,
}: ObjectFieldTemplateProps): JSX.Element {
    const { backgroundColor, helpText, classes, showDynamicTitle } =
        getUiOptions(uiSchema);
    const DEFAULT_BACKGROUND_COLOR = 'bg-gray-100';
    const DEFAULT_PADDING = 'p-6';
    const bgColor = backgroundColor ?? DEFAULT_BACKGROUND_COLOR;
    const customClasses = classes ?? DEFAULT_PADDING;

    const addressTypeField = properties.find((p) => p.name === 'addressType');
    const addressType = addressTypeField?.content?.props?.formData ?? '';

    return (
        <div
            className={`w-full max-w-[800px] rounded-md ${bgColor} ${customClasses}`}
        >
            {title && (
                <div className={styles.container + 'flex my-1'}>
                    <div className={styles.text}>{title} </div>
                    {helpInformation((helpText as string) ?? '')}
                </div>
            )}
            {showDynamicTitle && addressType && (
                <div className={styles.labelRequired}>{addressType} </div>
            )}
            <div className="flex flex-wrap gap-2">
                {properties
                    .filter((element) => {
                        return !element?.hidden;
                    })
                    .map(({ content, name }) => {
                        const width =
                            uiSchema[name]?.['ui:options']?.width || 100;
                        return (
                            <div
                                key={name}
                                className={`${widthClass(width)} flex flex-col`}
                            >
                                {content}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
