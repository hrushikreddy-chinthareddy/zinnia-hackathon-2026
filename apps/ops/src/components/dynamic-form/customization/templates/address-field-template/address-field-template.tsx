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
        : width === 20
        ? 'xs:basis-[calc(50%-0.25rem)] lg:basis-[calc(20%-0.25rem)]'
        : 'xs:basis-[calc(50%-0.25rem)] lg:basis-[calc(13%-0.25rem)]';
};

const LINE_ORDER = ['addressLine1', 'addressLine2', 'addressLine3'] as const;
const ROW_ORDER = ['zipCode', 'city', 'state'] as const;

/**
 * Transaction address layout: street lines full width, then ZIP | City | State row
 * (aligned with “Add address” modal). Skips address-type **radio** only.
 */
export default function AddressFieldTemplate({
    properties,
    uiSchema = {},
    title,
}: ObjectFieldTemplateProps): JSX.Element {
    const { backgroundColor, helpText, classes } = getUiOptions(uiSchema);
    const customClasses = classes ?? 'p-6';
    const bgColor =
        backgroundColor !== undefined
            ? backgroundColor
            : 'bg-white border border-gray-200 shadow-sm';

    const visible = properties.filter((element) => {
        if (element?.hidden) return false;
        if (element.name === 'addressType') {
            const w = uiSchema[element.name]?.['ui:widget'];
            if (w === 'RadioWidget') return false;
        }
        return true;
    });

    const pick = (names: readonly string[]) =>
        names
            .map((name) => visible.find((p) => p.name === name))
            .filter(Boolean) as typeof visible;

    const lineProps = pick(LINE_ORDER);
    const rowProps = pick(ROW_ORDER);
    const used = new Set<string>([
        ...LINE_ORDER,
        ...ROW_ORDER,
    ] as unknown as string[]);
    const rest = visible.filter((p) => !used.has(p.name));

    return (
        <div
            className={`w-full max-w-[800px] rounded-lg ${bgColor} ${customClasses}`}
        >
            {title && (
                <div className={styles.container + ' mb-4 flex'}>
                    <div className={styles.text}>{title} </div>
                    {helpInformation((helpText as string) ?? '')}
                </div>
            )}
            <div className="flex flex-col gap-4">
                {lineProps.map(({ content, name }) => (
                    <div key={name} className="w-full min-w-0">
                        {content}
                    </div>
                ))}

                {rowProps.length > 0 ? (
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start">
                        {rowProps.map(({ content, name }) => {
                            const rowBasis =
                                name === 'zipCode'
                                    ? 'sm:w-[22%] sm:min-w-[6.75rem] sm:flex-shrink-0'
                                    : name === 'city'
                                    ? 'sm:flex-1 sm:min-w-0'
                                    : 'sm:w-[32%] sm:min-w-[10rem] sm:flex-shrink-0';
                            return (
                                <div
                                    key={name}
                                    className={`w-full min-w-0 ${rowBasis}`}
                                >
                                    {content}
                                </div>
                            );
                        })}
                    </div>
                ) : null}

                {rest.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {rest.map(({ content, name }) => {
                            const width =
                                uiSchema[name]?.['ui:options']?.width || 100;
                            return (
                                <div
                                    key={name}
                                    className={`${widthClass(
                                        width
                                    )} flex min-w-0 flex-col`}
                                >
                                    {content}
                                </div>
                            );
                        })}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
