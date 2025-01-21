import { getUiOptions, UiSchema, WidgetProps } from '@rjsf/utils';
import router from 'next/router';

import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { ReactComponent as TrashDocumentIcon } from '@deps/styles/elements/icons/actions/external-link.svg';

const HyperLinkWidget = (props: WidgetProps) => {
    const { value, disabled, label, uiSchema } = props;

    const uiOptions = getUiOptions(uiSchema as UiSchema);

    return <HyperLink type={uiOptions.type} label={label} value={value} disabled={disabled} />;
};

export default HyperLinkWidget;

type HyperLinkProps = {
    title?: string;
    type: any;
    label: string;
    value: string;
    disabled?: boolean;
    className?: string;
};
export const HyperLink = ({ title, label, value, type, disabled, className }: HyperLinkProps) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, value: string) => {
        e.preventDefault();
        router.push(value);
    };

    // if (!type) {
    //     return (
    //         <div className={`flex flex-col ${className}`}>
    //             <div>{title}</div>
    //         </div>
    //     );
    // }
    return (
        <div className={`flex flex-col ${className}`}>
            {title && <div>{title}</div>}

            {type === 'link' ? (
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
                    <div className="flex gap-2">
                        {label}
                        <TrashDocumentIcon width={20} height={20} />
                    </div>
                </NavElement>
            ) : (
                <div className="">
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
            )}
        </div>
    );
};
