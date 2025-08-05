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
                'grid grid-cols-6 items-center content-start gap-x-3 gap-y-2 pb-6 border-border-light border-b-2'
            )}
        >
            <h3 className="col-span-1 min-w-[165px] [font:var(--typography-titles-subtitle)]">
                {title}
            </h3>

            {children}
        </section>
    );
}
