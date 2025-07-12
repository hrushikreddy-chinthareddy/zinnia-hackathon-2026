import { ReactNode, HTMLAttributes } from 'react';

type IllustrationDetailsContentEntryProps = {
    label?: string | null;
    children?: ReactNode;
    ddAriaLabel?: string;
    ddProps?: HTMLAttributes<HTMLDivElement>;
} & HTMLAttributes<HTMLDivElement>;

export default function IllustrationDetailsContentEntry({
    label,
    children,
    ddAriaLabel,
    ddProps = {},
    ...rest
}: IllustrationDetailsContentEntryProps) {
    return (
        <>
            <dt
                className="col-start-2 [font:var(--typography-labels-label-sm-alt)]"
                {...rest}
            >
                {label}
            </dt>
            <dd
                className="text-end [font:var(--typography-labels-label-sm-alt)]"
                {...ddProps}
                aria-label={ddAriaLabel}
            >
                {children}
            </dd>
        </>
    );
}
