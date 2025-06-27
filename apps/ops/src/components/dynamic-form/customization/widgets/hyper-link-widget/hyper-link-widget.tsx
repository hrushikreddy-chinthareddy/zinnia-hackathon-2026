import { getUiOptions, UiSchema, WidgetProps } from '@rjsf/utils';
import router from 'next/router';

import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { replacePlaceholders } from '@deps/helpers/value-placement.helpers';
import { ReactComponent as TrashDocumentIcon } from '@deps/styles/elements/icons/actions/external-link.svg';

const HyperLinkWidget = (props: WidgetProps) => {
    const { value, disabled, label, uiSchema, formContext, readonly } = props;

    const defaultValue =
        replacePlaceholders(value, { ...formContext }) || value;
    const defaultLabel =
        replacePlaceholders(label, { ...formContext }) || label;

    const uiOptions = getUiOptions(uiSchema as UiSchema);

    return (
        <HyperLink
            type={uiOptions.type}
            label={defaultLabel}
            value={defaultValue}
            disabled={disabled}
            readonly={readonly}
        />
    );
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
        <div className={`flex flex-col ${className}`}>
            {title && <div>{title}</div>}

            {type === 'link' ? (
                <NavElement
                    className="text-left font-semibold"
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
                        className="text-left font-semibold underline underline-offset-2"
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
