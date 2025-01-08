import { getUiOptions, UiSchema, WidgetProps } from '@rjsf/utils';
import router from 'next/router';

import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';

const HyperLinkWidget = (props: WidgetProps) => {
    const { value, disabled, label, uiSchema } = props;

    const uiOptions = getUiOptions(uiSchema as UiSchema);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, value: string) => {
        e.preventDefault();
        router.push(value);
    };

    return uiOptions?.type === 'link' ? (
        <NavElement
            className="text-left underline underline-offset-2"
            size={NavElementSize.Small}
            title={label}
            type={NavElementType.Link}
            variant={NavElementVariant.Secondary}
            href={value}
            isNewPage={true}
            target="_blank"
            disabled={disabled}
        >
            {label}
        </NavElement>
    ) : (
        <div className="max-w-sm flex w-full flex-col">
            <NavElement
                className="text-left underline underline-offset-2"
                size={NavElementSize.Small}
                title={label}
                type={NavElementType.Link}
                variant={NavElementVariant.Secondary}
                onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleClick(e, value)}
                disabled={disabled}
            >
                {label}
            </NavElement>
        </div>
    );
};

export default HyperLinkWidget;
