import { Skeleton } from '@radix-ui/themes';

import { QuickViewRoot } from './quick-view-root/quick-view-root';

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

export const ButtonSkeleton = () => {
    return (
        <div className="flex justify-end">
            <Skeleton width="100px" height="32px" />
        </div>
    );
};

export const OwnerInfoSkeleton = () => {
    return (
        <QuickViewRoot title={' '}>
            <LabelContentSkeleton />
            <LabelContentSkeleton />
            <LabelContentSkeleton />
            <LabelContentSkeleton />
            <LabelContentSkeleton />
            <LabelContentSkeleton contentLines={3} />
        </QuickViewRoot>
    );
};
