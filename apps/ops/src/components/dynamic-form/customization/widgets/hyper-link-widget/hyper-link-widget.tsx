import { getUiOptions, UiSchema, WidgetProps } from '@rjsf/utils';
import router from 'next/router';

import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { replacePlaceholders } from '@deps/helpers/value-placement.helpers';
import { ReactComponent as TrashDocumentIcon } from '@deps/styles/elements/icons/actions/external-link.svg';

const HyperLinkWidget = (props: WidgetProps) => {
    const { value, disabled, label, uiSchema, formContext, readonly, schema } =
        props;
    const uiOptions = getUiOptions(uiSchema as UiSchema);
    const defaultValue = replacePlaceholders(schema?.default ?? value, {
        ...formContext,
        value,
    });
    const defaultLabel =
        replacePlaceholders(label, { ...formContext, value }) || label;

    const renderHyperLink = (label: string, link: string, idx?: number) => (
        <HyperLink
            key={idx}
            type={uiOptions.type}
            label={label}
            value={link}
            disabled={disabled}
            readonly={readonly}
        />
    );

    if (uiOptions.inline) {
        const itemProperties = (schema?.items as any)?.properties;
        return (
            <div className="grid grid-cols-[200px_auto] text-md gap-2">
                <div className="font-medium text-gray-500 ">
                    {schema.title || defaultLabel}
                </div>
                <div className="flex flex-col">
                    {Array.isArray(defaultValue)
                        ? defaultValue.map((item: any, idx: number) => {
                              const replacedItem =
                                  replacePlaceholders(itemProperties, {
                                      ...formContext,
                                      ...item,
                                  }) || {};
                              const itemLabel =
                                  replacedItem?.urlLabel?.default ||
                                  `Document ${idx + 1}`;
                              const itemValue = replacedItem?.urlValue?.default;

                              return (
                                  <HyperLink
                                      key={idx}
                                      type={uiOptions.type}
                                      label={itemLabel}
                                      value={itemValue}
                                      disabled={disabled}
                                      readonly={readonly}
                                  />
                              );
                          })
                        : renderHyperLink(defaultLabel, defaultValue)}
                </div>
            </div>
        );
    }
    return renderHyperLink(defaultLabel, defaultValue);
};

export default HyperLinkWidget;

type HyperLinkProps = {
    title?: string;
    type: any;
    label: string;
    value: string;
    disabled?: boolean;
    className?: string;
    readonly?: boolean;
};
export const HyperLink = ({
    title,
    label,
    value,
    type,
    disabled,
    readonly,
    className,
}: HyperLinkProps) => {
    const handleClick = (
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
        value: string
    ) => {
        e.preventDefault();
        router.push(value);
    };

    return (
        <div className={`flex ${className}`}>
            {title && <div>{title}</div>}

            {type === 'link' ? (
                <NavElement
                    className="text-left"
                    size={NavElementSize.Small}
                    title={label}
                    type={NavElementType.Link}
                    href={value}
                    isNewPage={true}
                    target="_blank"
                    disabled={disabled || readonly}
                    startIcon={<TrashDocumentIcon width={20} height={20} />}
                >
                    {label}
                </NavElement>
            ) : (
                <div className="">
                    <NavElement
                        className="text-left"
                        size={NavElementSize.Small}
                        title={label}
                        type={NavElementType.Link}
                        onClick={(
                            e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
                        ) => handleClick(e, value)}
                        disabled={disabled || readonly}
                    >
                        {label}
                    </NavElement>
                </div>
            )}
        </div>
    );
};
