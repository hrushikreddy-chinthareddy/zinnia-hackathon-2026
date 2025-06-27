import { ObjectFieldTemplateProps } from '@rjsf/utils';

export default function AddressFieldTemplate({
    properties,
    uiSchema = {},
}: ObjectFieldTemplateProps): JSX.Element {
    return (
        <div className="w-full max-w-lg bg-gray-100 p-6 rounded-md">
            <div className="flex flex-wrap gap-4">
                {properties.map(({ content, name }) => {
                    const width = uiSchema[name]?.['ui:options']?.width || 100; // Default to full width
                    const widthClass =
                        width === 100
                            ? 'w-full'
                            : width === 75
                            ? 'w-3/4'
                            : width === 60
                            ? 'w-3/5'
                            : width === 50
                            ? 'w-1/2'
                            : width === 33
                            ? 'w-1/3'
                            : width === 25
                            ? 'w-1/4'
                            : 'w-1/5';

                    return (
                        <div
                            key={name}
                            className={`${widthClass} flex flex-col`}
                        >
                            {content}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
