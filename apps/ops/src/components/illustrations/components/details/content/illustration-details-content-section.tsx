import clsx from 'clsx';
import { ReactNode, HTMLAttributes } from 'react';

interface IllustrationDetailsContentSection
    extends Pick<HTMLAttributes<HTMLDivElement>, 'className'> {
    title: string;
    children: ReactNode;
}

export default function IllustrationDetailsContentSection({
    className,
    title,
    children,
}: IllustrationDetailsContentSection) {
    return (
        <section
            className={clsx(
                className,
                'grid grid-cols-3 items-center content-start gap-x-6 gap-y-2 pb-6 border-border-light border-b-2'
            )}
        >
            <h3 className="[font:var(--typography-titles-subtitle)]">
                {title}
            </h3>

            {children}
        </section>
    );
}
