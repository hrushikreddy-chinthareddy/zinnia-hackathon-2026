import { Skeleton } from '@radix-ui/themes';

import { QuickViewRoot } from './policy-summary-card';

export const LabelContentSkeleton = ({
    contentLines = 1,
}: {
    contentLines?: number;
}) => (
    <div className="flex flex-col gap-1">
        <Skeleton width="80px" height="16px" />
        {Array.from({ length: contentLines }).map((_, index) => (
            <Skeleton key={index} width="130px" height="16px" />
        ))}
    </div>
);

export const QuickViewSkeleton = () => {
    return (
        <QuickViewRoot title={''}>
            <LabelContentSkeleton />
            <LabelContentSkeleton />
            <LabelContentSkeleton />
            <LabelContentSkeleton />
            <LabelContentSkeleton />
            <LabelContentSkeleton />
        </QuickViewRoot>
    );
};

export const OwnerInfoSkeleton = () => {
    return (
        <QuickViewRoot title={' '}>
            <div className="grid grid-cols-2 gap-10 md:grid-cols-1 lg:grid-cols-2">
                <LabelContentSkeleton />
                <LabelContentSkeleton />
            </div>
            <div className="grid grid-cols-2 gap-10 md:grid-cols-1 lg:grid-cols-2">
                <LabelContentSkeleton />
                <LabelContentSkeleton />
            </div>
            <div className="grid grid-cols-2 gap-10 md:grid-cols-1 lg:grid-cols-2">
                <LabelContentSkeleton />
                <LabelContentSkeleton contentLines={3} />
            </div>
        </QuickViewRoot>
    );
};
