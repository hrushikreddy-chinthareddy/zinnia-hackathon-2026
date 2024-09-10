import clsx from 'clsx';
import { PropsWithChildren } from 'react';

export type DividerLabelProps = PropsWithChildren;

const DividerLabel = ({ children }: DividerLabelProps) => (
    <div
        className={clsx(
            'mt-2 flex w-full flex-nowrap items-center justify-center gap-4 text-center align-middle text-base text-gray-600',
            'before:h-0 before:flex-grow before:border-b-1 before:border-dashed',
            'after:h-0 after:flex-grow after:border-b-1 after:border-dashed'
        )}
    >
        {children}
    </div>
);

export default DividerLabel;
